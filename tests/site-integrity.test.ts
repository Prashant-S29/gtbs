import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { categories } from "../src/data/categories.ts";
import { addCartItem, markCartAsViewed } from "../src/lib/storefrontStorage.ts";
import { createWhatsAppOrderUrl } from "../src/lib/whatsappOrder.ts";

const root = process.cwd();

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const item = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(item) : [item];
  });
}

const sourceFiles = walk(path.join(root, "src")).filter((file) =>
  /\.(?:ts|tsx|css)$/.test(file),
);

test("all literal public image references resolve to existing files", () => {
  const missing: string[] = [];

  for (const file of sourceFiles) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(
      /["'`](\/images\/[A-Za-z0-9_./ -]+)["'`]/g,
    )) {
      const publicFile = path.join(root, "public", match[1]);
      if (!existsSync(publicFile)) {
        missing.push(`${path.relative(root, file)} -> ${match[1]}`);
      }
    }
  }

  assert.deepEqual(missing, []);
});

test("literal internal links target an App Router page", () => {
  const routePatterns = walk(path.join(root, "src", "app"))
    .filter((file) => path.basename(file) === "page.tsx")
    .map((file) => {
      const route = path
        .relative(path.join(root, "src", "app"), path.dirname(file))
        .split(path.sep)
        .filter((segment) => !/^\(.+\)$/.test(segment))
        .map((segment) => (segment.startsWith("[") ? "[^/]+" : segment))
        .join("/");
      return new RegExp(`^/${route}$`.replace("//$", "/$"));
    });
  const broken: string[] = [];
  const hrefPattern =
    /(?:href\s*=\s*|href:\s*)["'](\/[A-Za-z0-9_./?=&%#-]*)["']/g;

  for (const file of sourceFiles) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(hrefPattern)) {
      const pathname = match[1].split(/[?#]/, 1)[0] || "/";
      if (!routePatterns.some((pattern) => pattern.test(pathname))) {
        broken.push(`${path.relative(root, file)} -> ${match[1]}`);
      }
    }
  }

  assert.deepEqual(broken, []);
});

test("visible catalog links use the canonical All Products route", () => {
  const files = [
    path.join(
      root,
      "src",
      "components",
      "product",
      "LocalizedProductBreadcrumb.tsx",
    ),
    path.join(root, "src", "app", "not-found.tsx"),
    path.join(root, "src", "app", "blogs", "[id]", "page.tsx"),
    path.join(root, "src", "app", "product", "layout.tsx"),
  ];

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /(?:href=|path:)\s*["']\/shop(?:[?"'])/);
  }

  const breadcrumb = readFileSync(files[0], "utf8");
  assert.match(breadcrumb, /label: t\("product\.products"\)/);
  assert.match(breadcrumb, /href: "\/allproducts"/);
  assert.match(
    breadcrumb,
    /href: `\/allproducts\?category=\$\{product\.category\}`/,
  );
});

test("Product detail thumbnails render horizontally below the main image", () => {
  const source = readFileSync(
    path.join(root, "src", "components", "product", "ProductImages.tsx"),
    "utf8",
  );
  const mainImagePosition = source.indexOf("{/* Main Image Stage */}");
  const thumbnailPosition = source.indexOf("{/* Horizontal Thumbnails */}");

  assert.notEqual(mainImagePosition, -1);
  assert.notEqual(thumbnailPosition, -1);
  assert.equal(mainImagePosition < thumbnailPosition, true);
  assert.match(source, /relative aspect-square w-full/);
  assert.match(source, /flex max-w-full gap-3 overflow-x-auto pb-2/);
  assert.match(source, /relative h-20 w-20 shrink-0/);
  assert.doesNotMatch(source, /aspect-\[3\/4\]|h-20 w-16|h-16 w-16/);
  assert.doesNotMatch(source, /md:flex-col/);
});

test("Product detail purchase controls remain compact and balanced", () => {
  const source = readFileSync(
    path.join(root, "src", "components", "product", "ProductInfo.tsx"),
    "utf8",
  );

  assert.match(source, /mt-7 flex flex-col gap-3 sm:flex-row/);
  assert.match(source, /grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto/);
  assert.match(source, /h-11 w-28/);
  assert.match(source, /sm:min-w-36/);
  assert.match(source, /sm:min-w-32/);
  assert.doesNotMatch(source, /sm:grid-cols-\[128px_minmax/);
});

test("Header Categories controls use route-independent styling", () => {
  const source = readFileSync(
    path.join(root, "src", "components", "layout", "Header.tsx"),
    "utf8",
  );

  assert.doesNotMatch(source, /isCategoryActive/);
  assert.match(
    source,
    /isCategoryMenuOpen\s*\? "border-orange-500 bg-orange-500 text-white"/,
  );
  assert.match(
    source,
    /isMobileCategoriesOpen\s*\? "bg-orange-500 text-white"/,
  );
  assert.match(source, /aria-expanded=\{isCategoryMenuOpen\}/);
  assert.match(source, /aria-expanded=\{isMobileCategoriesOpen\}/);
});

test("Header category menus use repository data without static fallbacks", () => {
  const header = readFileSync(
    path.join(root, "src", "components", "layout", "Header.tsx"),
    "utf8",
  );
  const siteChrome = readFileSync(
    path.join(root, "src", "components", "layout", "SiteChrome.tsx"),
    "utf8",
  );
  const rootLayout = readFileSync(
    path.join(root, "src", "app", "layout.tsx"),
    "utf8",
  );

  assert.match(rootLayout, /const categories = await getCategories\(\)/);
  assert.match(rootLayout, /<body[^>]+suppressHydrationWarning>/);
  assert.match(rootLayout, /<SiteChrome categories=\{categories\}>/);
  assert.match(siteChrome, /<Header categories=\{categories\} \/>/);
  assert.match(header, /navigationCategories\.map/);
  assert.match(header, /navigationCategories\.length === 0/);
  assert.doesNotMatch(
    header,
    /Holy Bibles|Christian Living|Devotionals|Kids & Youth/,
  );
});

test("Gujarati home hero uses a bounded compact desktop layout", () => {
  const source = readFileSync(
    path.join(root, "src", "components", "home", "HeroSection.tsx"),
    "utf8",
  );
  const globalStyles = readFileSync(
    path.join(root, "src", "app", "globals.css"),
    "utf8",
  );

  assert.match(source, /"use client"/);
  assert.match(source, /useLanguage/);
  assert.match(source, /t\("home\.hero\.titleLine1"\)/);
  assert.match(
    source,
    /home-hero-heading-group flex flex-col items-start gap-6/,
  );
  assert.match(
    globalStyles,
    /html\[lang="gu"\] \.home-hero-heading-group \{\s*gap: 0\.5rem;/,
  );
  assert.match(
    globalStyles,
    /html\[lang="gu"\] \.home-hero-description \{\s*margin-top: 0\.75rem;/,
  );
  assert.match(
    globalStyles,
    /html\[lang="gu"\] \.home-hero-actions \{\s*margin-top: 1\.5rem;/,
  );
  assert.match(globalStyles, /height: 420px;\s*min-height: 0;/);
});

test("storefront dictionaries stay in sync without a DOM translation runtime", () => {
  interface TranslationSection {
    [key: string]: string | TranslationSection;
  }
  const englishDictionary = JSON.parse(
    readFileSync(path.join(root, "src", "data", "english.json"), "utf8"),
  ) as TranslationSection;
  const gujaratiDictionary = JSON.parse(
    readFileSync(path.join(root, "src", "data", "gujarati.json"), "utf8"),
  ) as TranslationSection;
  const languageContext = readFileSync(
    path.join(root, "src", "contexts", "LanguageContext.tsx"),
    "utf8",
  );
  const i18n = readFileSync(
    path.join(root, "src", "lib", "storefrontI18n.ts"),
    "utf8",
  );

  const flatten = (
    section: TranslationSection,
    prefix = "",
  ): Record<string, string> =>
    Object.entries(section).reduce<Record<string, string>>(
      (result, [segment, value]) => {
        const key = prefix ? `${prefix}.${segment}` : segment;
        return typeof value === "string"
          ? { ...result, [key]: value }
          : { ...result, ...flatten(value, key) };
      },
      {},
    );
  const english = flatten(englishDictionary);
  const gujarati = flatten(gujaratiDictionary);

  assert.deepEqual(Object.keys(english).sort(), Object.keys(gujarati).sort());
  assert.equal(Object.keys(english).length > 150, true);
  assert.deepEqual(Object.keys(englishDictionary), [
    "language",
    "nav",
    "search",
    "action",
    "home",
    "product",
    "cart",
    "catalog",
    "blog",
    "gallery",
    "contact",
    "errors",
    "common",
    "whatsapp",
    "about",
    "policies",
    "faqContent",
    "footer",
  ]);
  assert.deepEqual(
    Object.keys(englishDictionary),
    Object.keys(gujaratiDictionary),
  );
  for (const key of Object.keys(english)) {
    const placeholders = (value: string) =>
      [...value.matchAll(/\{([A-Za-z][A-Za-z0-9]*)\}/g)]
        .map((match) => match[1])
        .sort();
    assert.deepEqual(
      placeholders(english[key]),
      placeholders(gujarati[key]),
      `Interpolation placeholders differ for ${key}`,
    );
  }
  assert.match(languageContext, /translateStorefront\(language, key, params\)/);
  assert.match(i18n, /replaceAll\(`\{\$\{name\}\}`/);
  assert.doesNotMatch(
    languageContext,
    /translate\.google\.com|google_translate_element|goog-te-combo|window\.location\.reload/,
  );
});

test("remaining public page copy is sourced from the storefront dictionaries", () => {
  const source = (relativePath: string) =>
    readFileSync(path.join(root, relativePath), "utf8");

  assert.match(
    source("src/components/about/OurStory.tsx"),
    /t\("about\.story\.titleLine1"\)/,
  );
  assert.match(
    source("src/components/about/VisionMission.tsx"),
    /t\("about\.mission\.description"\)/,
  );
  assert.match(source("src/data/faqs.ts"), /faqContent\.\$\{section\}/);
  assert.match(source("src/components/common/Faq.tsx"), /t\(faq\.answerKey\)/);
  assert.match(
    source("src/components/common/LegalPolicyPage.tsx"),
    /policies\.\$\{policy\}/,
  );
  assert.match(
    source("src/app/privacy-policy/page.tsx"),
    /<LegalPolicyPage policy="privacy" \/>/,
  );
  assert.match(
    source("src/app/terms-and-conditions/page.tsx"),
    /<LegalPolicyPage policy="terms" \/>/,
  );
  assert.match(
    source("src/app/shipping-and-delivery-policy/page.tsx"),
    /<LegalPolicyPage policy="shipping" \/>/,
  );
  assert.match(
    source("src/components/layout/SiteChrome.tsx"),
    /translationKey="common\.skipToContent"/,
  );
  assert.match(
    source("src/components/product/ProductGrid.tsx"),
    /translationKey="catalog\.noProductsCriteria"/,
  );
});

test("Contact phone numbers stay on one untranslated line", () => {
  const source = readFileSync(
    path.join(root, "src", "components", "contact", "ContactSection.tsx"),
    "utf8",
  );

  assert.match(source, /flex flex-nowrap items-center gap-3/);
  assert.equal(
    (
      source.match(
        /notranslate whitespace-nowrap|notranslate mt-1 whitespace-nowrap/g,
      ) || []
    ).length,
    2,
  );
  assert.equal((source.match(/translate="no"/g) || []).length, 2);
  assert.equal((source.match(/dir="ltr"/g) || []).length, 2);
});

test("Admin Product variants use individual option inputs", () => {
  const source = readFileSync(
    path.join(
      root,
      "src",
      "components",
      "admin",
      "product",
      "AdminProductForm.tsx",
    ),
    "utf8",
  );

  assert.doesNotMatch(source, /Options, one per line/);
  assert.match(source, />\s*Add option\s*</);
  assert.match(source, /aria-label=\{`Remove option /);
  assert.match(source, /\{ name: "", options: \[""\] \}/);
  assert.match(source, /getCollectionError\(/);
  assert.doesNotMatch(
    source,
    /focus:border-orange-500|focus:ring-2 focus:ring-orange/,
  );
  assert.match(source, /admin-product-input/);

  const globalStyles = readFileSync(
    path.join(root, "src", "app", "globals.css"),
    "utf8",
  );
  assert.match(
    globalStyles,
    /\.admin-product-input:focus-visible\s*\{\s*outline: none;/,
  );
});

test("Admin Product specifications use grouped individual value inputs", () => {
  const source = readFileSync(
    path.join(
      root,
      "src",
      "components",
      "admin",
      "product",
      "AdminProductForm.tsx",
    ),
    "utf8",
  );

  assert.match(source, />\s*Specification name\s*<input/);
  assert.match(source, />\s*Values\s*</);
  assert.match(source, />\s*Add value\s*</);
  assert.match(source, /aria-label=\{`Remove value /);
  assert.match(source, /flattenSpecifications\(specifications\)/);
  assert.match(source, /\{ name: "", values: \[""\] \}/);
});

test("Admin Product features use individual addable and removable inputs", () => {
  const source = readFileSync(
    path.join(
      root,
      "src",
      "components",
      "admin",
      "product",
      "AdminProductForm.tsx",
    ),
    "utf8",
  );

  assert.doesNotMatch(
    source,
    /Features, one per line|Gujarati features, one per line/,
  );
  assert.match(source, /aria-label=\{`Add another feature after /);
  assert.match(source, /aria-label=\{`Remove feature /);
  assert.match(source, /normalizeFeatures\(features\)/);
  assert.match(source, /normalizeFeatures\(gujaratiFeatures\)/);
});

test("Admin Category CRUD uses English then Gujarati final submission", () => {
  const categoryManager = readFileSync(
    path.join(
      root,
      "src",
      "components",
      "admin",
      "category",
      "AdminCategoryManager.tsx",
    ),
    "utf8",
  );
  const productForm = readFileSync(
    path.join(
      root,
      "src",
      "components",
      "admin",
      "product",
      "AdminProductForm.tsx",
    ),
    "utf8",
  );

  assert.match(categoryManager, /AdminBilingualFormSteps/);
  assert.match(categoryManager, /useState<AdminContentLanguage>\("en"\)/);
  assert.match(
    categoryManager,
    /formLanguage === "en"[\s\S]+setFormLanguage\("gu"\)[\s\S]+return;/,
  );
  assert.match(categoryManager, /name="gujaratiName"/);
  assert.match(
    categoryManager,
    /const payload = \{ name, gujarati: \{ name: gujaratiName \} \}/,
  );
  assert.match(categoryManager, /formLanguage === "en"[\s\S]+\? "Next"/);
  assert.match(categoryManager, /flex-col-reverse gap-2 sm:flex-row/);
  assert.match(categoryManager, /whitespace-nowrap[^"]+sm:w-\[118px\]/);
  assert.match(categoryManager, /type="submit"/);
  assert.match(productForm, /categoryCreatorLanguage === "en"/);
  assert.match(productForm, /\{ name, gujarati: \{ name: gujaratiName \} \}/);
});

test("Admin navigation lives in the persistent route layout", () => {
  const layout = readFileSync(
    path.join(root, "src", "app", "admin", "layout.tsx"),
    "utf8",
  );
  const panelShell = readFileSync(
    path.join(root, "src", "components", "admin", "AdminPanelShell.tsx"),
    "utf8",
  );
  const contentShell = readFileSync(
    path.join(root, "src", "components", "admin", "AdminContentShell.tsx"),
    "utf8",
  );

  assert.match(layout, /<AdminPanelShell>\{children\}<\/AdminPanelShell>/);
  assert.match(panelShell, /usePathname\(\)/);
  assert.match(panelShell, /<aside /);
  assert.match(panelShell, /pathname\.startsWith\(`\$\{href\}\/`\)/);
  assert.doesNotMatch(panelShell, /window\.location|location\.href/);
  assert.doesNotMatch(contentShell, /<aside |Admin navigation|min-h-screen/);
});

test("Admin Overview derives every managed section from repository data", () => {
  const source = readFileSync(
    path.join(root, "src", "app", "admin", "dashboard", "page.tsx"),
    "utf8",
  );

  assert.match(source, /export const dynamic = "force-dynamic"/);
  for (const getter of [
    "getProducts",
    "getCategories",
    "getBlogs",
    "getGalleries",
    "getTestimonials",
    "getTeamMembers",
  ]) {
    assert.match(source, new RegExp(`${getter}\\(\\)`));
  }
  assert.match(source, /await Promise\.all/);
  assert.match(source, /Products by category/);
  assert.match(source, /Content snapshot/);
  assert.doesNotMatch(
    source,
    /Total revenue|Total orders|Sales overview|Recent orders/,
  );
});

test("all storefront and Admin content persistence uses Drizzle PostgreSQL", () => {
  const repository = readFileSync(
    path.join(root, "src", "lib", "contentRepository.ts"),
    "utf8",
  );
  const databaseClient = readFileSync(
    path.join(root, "src", "db", "client.ts"),
    "utf8",
  );
  const databaseSchema = readFileSync(
    path.join(root, "src", "db", "schema.ts"),
    "utf8",
  );
  const seedScript = readFileSync(
    path.join(root, "scripts", "seed-db.ts"),
    "utf8",
  );
  const packageJson = readFileSync(path.join(root, "package.json"), "utf8");

  assert.match(repository, /getDatabase\(\)/);
  assert.match(repository, /lockedTransaction/);
  assert.doesNotMatch(repository, /node:fs|storage\/content\.json|writeFile/);
  assert.match(databaseClient, /drizzle-orm\/node-postgres/);
  assert.match(databaseClient, /process\.env\.DATABASE_URL/);
  for (const table of [
    "categories",
    "products",
    "blogs",
    "galleries",
    "testimonials",
    "team_members",
  ]) {
    assert.match(databaseSchema, new RegExp(`pgTable\\(\\s*"${table}"`));
  }
  assert.match(seedScript, /content_initialized/);
  assert.match(seedScript, /source: "committed seeds"/);
  assert.doesNotMatch(seedScript, /node:fs|storage\//);
  assert.match(packageJson, /"db:setup": "pnpm db:migrate && pnpm db:seed"/);
});

test("Admin Storefront action opens safely in a new tab", () => {
  const source = readFileSync(
    path.join(root, "src", "components", "admin", "AdminPanelShell.tsx"),
    "utf8",
  );
  const storefrontLink = source.match(
    /<Link\s+href="\/"[\s\S]*?>[\s\S]*?Storefront\s*<\/Link>/,
  )?.[0];

  assert.ok(storefrontLink);
  assert.match(storefrontLink, /target="_blank"/);
  assert.match(storefrontLink, /rel="noopener noreferrer"/);
  assert.match(storefrontLink, /aria-label="Open storefront in a new tab"/);
});

test("Vercel previews are excluded from search indexing at every layer", () => {
  const vercelConfig = readFileSync(path.join(root, "vercel.json"), "utf8");
  const nextConfig = readFileSync(path.join(root, "next.config.ts"), "utf8");
  const rootLayout = readFileSync(
    path.join(root, "src/app/layout.tsx"),
    "utf8",
  );
  const robotsRoute = readFileSync(
    path.join(root, "src/app/robots.ts"),
    "utf8",
  );

  assert.match(vercelConfig, /"\*": false/u);
  assert.match(vercelConfig, /"\*\*": false/u);
  assert.match(vercelConfig, /"main": true/u);
  assert.match(vercelConfig, /"staging": true/u);
  assert.match(nextConfig, /X-Robots-Tag/u);
  assert.match(nextConfig, /noindex, nofollow, noarchive/u);
  assert.match(rootLayout, /VERCEL_ENV === "preview"/u);
  assert.match(rootLayout, /index: !isPreviewDeployment/u);
  assert.match(robotsRoute, /disallow: "\/"/u);
});

test("Admin auth and recovery use Better Auth with server-owned Resend", () => {
  const loginForm = readFileSync(
    path.join(
      root,
      "src",
      "components",
      "admin",
      "login",
      "AdminLoginForm.tsx",
    ),
    "utf8",
  );
  const auth = readFileSync(path.join(root, "src", "lib", "auth.ts"), "utf8");
  const email = readFileSync(path.join(root, "src", "lib", "email.ts"), "utf8");

  assert.match(loginForm, /authClient\.signIn\.email/);
  assert.match(auth, /sendResetPassword/);
  assert.match(auth, /revokeSessionsOnPasswordReset: true/);
  assert.match(email, /new Resend/);
  assert.match(email, /support@gtbsbooks\.com/);
  assert.doesNotMatch(`${loginForm}\n${auth}\n${email}`, /EmailJS|EMAILJS/);
});

test("UploadThing server uploads use only the canonical ufsUrl", () => {
  const imageUpload = readFileSync(
    path.join(root, "src", "lib", "imageUpload.ts"),
    "utf8",
  );
  const uploadThingPatch = readFileSync(
    path.join(root, "patches", "uploadthing@7.7.4.patch"),
    "utf8",
  );

  assert.match(imageUpload, /url: result\.data\.ufsUrl/);
  assert.doesNotMatch(imageUpload, /result\.data\.(?:url|appUrl)/);
  assert.match(uploadThingPatch, /\+\s*url: response\.ufsUrl/);
  assert.match(uploadThingPatch, /\+\s*appUrl: response\.ufsUrl/);
});

test("Admin CRUD leaves content identifiers to the backend", () => {
  const adminComponentRoot = path.join(root, "src", "components", "admin");
  const formFiles = [
    ["blog", "AdminBlogForm.tsx"],
    ["gallery", "AdminGalleryForm.tsx"],
    ["product", "AdminProductForm.tsx"],
    ["category", "AdminCategoryManager.tsx"],
  ].map((segments) => path.join(adminComponentRoot, ...segments));

  for (const file of formFiles) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /name=["']slug["']|>\s*Slug\s*</);
  }

  const clientHelpers = readFileSync(
    path.join(root, "src", "lib", "adminContentClient.ts"),
    "utf8",
  );
  assert.doesNotMatch(clientHelpers, /export function slugify/);
});

test("client modules do not reference server-only secrets", () => {
  const exposed: string[] = [];
  const serverOnlyName =
    /process\.env\.(?:ADMIN_[A-Z0-9_]+|UPLOADTHING_TOKEN|DATABASE_URL)/g;

  for (const file of sourceFiles.filter((item) => item.endsWith(".tsx"))) {
    const source = readFileSync(file, "utf8");
    if (!/^\s*["']use client["'];/.test(source)) continue;
    if (serverOnlyName.test(source)) exposed.push(path.relative(root, file));
    serverOnlyName.lastIndex = 0;
  }

  assert.deepEqual(exposed, []);
});

test("homepage Magazines use only the canonical admin Product category", () => {
  const homeSource = readFileSync(
    path.join(root, "src", "app", "page.tsx"),
    "utf8",
  );
  const magazineSource = readFileSync(
    path.join(root, "src", "components", "home", "Magazines.tsx"),
    "utf8",
  );

  assert.equal(
    categories.some(
      (category) =>
        category.slug === "magazines" && category.name === "Magazines",
    ),
    true,
  );
  assert.match(homeSource, /product\.category === "magazines"/);
  assert.doesNotMatch(
    magazineSource,
    /fallbackMagazines|DefaultMagazineCover|Faith & Life Magazine|Christian Living Digest|The Good News Monthly/,
  );
  assert.doesNotMatch(magazineSource, /return null/);
  assert.match(magazineSource, /t\("home\.collection\.empty"\)/);
});

test("cart notification is unread after adding and acknowledged after viewing", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const storedValues = new Map<string, string>();
  const browserWindow = new EventTarget() as EventTarget & {
    localStorage: Pick<Storage, "getItem" | "setItem">;
  };
  browserWindow.localStorage = {
    getItem: (key) => storedValues.get(key) ?? null,
    setItem: (key, value) => storedValues.set(key, value),
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: browserWindow,
  });

  try {
    assert.equal(
      addCartItem({
        productId: "notification-test",
        title: "Notification test product",
        price: 100,
        image: "/images/products/book-placeholder.svg",
      }),
      true,
    );
    assert.equal(storedValues.get("gtbs-cart-notification-v1"), "1");

    assert.equal(markCartAsViewed(), true);
    assert.equal(storedValues.get("gtbs-cart-notification-v1"), "0");
  } finally {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
  }
});

test("single-Product WhatsApp orders include greeting, quantity, details, and link", () => {
  const url = new URL(
    createWhatsAppOrderUrl([
      {
        title: "Gujarati Study Bible",
        quantity: 3,
        unitPrice: 250,
        variantSummary: "Edition: Hardcover",
        productUrl: "https://example.com/product/gujarati-study-bible",
      },
    ]),
  );
  const message = url.searchParams.get("text") || "";

  assert.equal(url.hostname, "wa.me");
  assert.match(message, /Hello GTBS Book Store!/);
  assert.match(message, /Gujarati Study Bible/);
  assert.match(message, /Quantity: 3/);
  assert.match(message, /Details: Edition: Hardcover/);
  assert.match(
    message,
    /https:\/\/example\.com\/product\/gujarati-study-bible/,
  );
});

test("multi-Product WhatsApp orders include every line and the aggregate total", () => {
  const url = new URL(
    createWhatsAppOrderUrl(
      [
        {
          title: "Product One",
          quantity: 1,
          unitPrice: 100,
          productUrl: "https://example.com/product/one",
        },
        {
          title: "Product Two",
          quantity: 2,
          unitPrice: 200,
          productUrl: "https://example.com/product/two",
        },
      ],
      500,
    ),
  );
  const message = url.searchParams.get("text") || "";

  assert.match(message, /1\. Product One/);
  assert.match(message, /2\. Product Two/);
  assert.match(message, /Quantity: 2/);
  assert.match(message, /Total:/);
  assert.match(message, /confirm availability, delivery, and payment details/i);
});
