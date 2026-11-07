import { extractRuntimeEnums } from "./extract-openapi-enums";
import "reflect-metadata";
import path from "node:path";
import { format } from "oxfmt";
process.env["SKIP_ENV_VALIDATION"] = "true";

const formatConfig = (await Bun.file(
  new URL("../../.oxfmtrc.json", import.meta.url),
).json()) as Parameters<typeof format>[2];

/** Formats generated output with the same options the pre-commit hook uses. */
async function formatSource(fileName: string, source: string): Promise<string> {
  const { code, errors } = await format(fileName, source, formatConfig);
  if (errors.length > 0) {
    throw new Error(
      `oxfmt could not format ${fileName}: ${errors
        .map((error) => error.message)
        .join("; ")}`,
    );
  }
  return code;
}

async function generate() {
  const { NestFactory } = await import("@nestjs/core");
  const { AppModule } = await import("../src/app.module");
  const { createOpenApiDocument } =
    await import("../src/common/config/openapi.config");
  const { setupGlobalPrefix } =
    await import("../src/common/config/api-prefix.config");

  const app = await NestFactory.create(AppModule, { logger: false });
  setupGlobalPrefix(app);
  const document = createOpenApiDocument(app);
  await app.close();

  const openapiTSModule = await import("openapi-typescript");
  const openapiTS = openapiTSModule.default;
  const { astToString } = openapiTSModule;

  // 1. Export raw OpenAPI specification to openapi.json
  const specPath = "openapi.json";
  const rawSpec = `${JSON.stringify(document, null, 2)}\n`;
  await Bun.write(specPath, await formatSource("openapi.json", rawSpec));
  console.log(`OpenAPI specification successfully exported to ${specPath}`);

  // 2. Generate typed TypeScript definitions from the OpenAPI specification
  const ast = await openapiTS(
    document as unknown as Parameters<typeof openapiTS>[0],
  );
  const rawContents = astToString(ast);

  const outputPaths = [
    path.resolve(import.meta.dirname, "../test/generated/api-schema.d.ts"),
    path.resolve(import.meta.dirname, "../../admin/src/types/api-schema.d.ts"),
    path.resolve(
      import.meta.dirname,
      "../../storefront/src/types/api-schema.d.ts",
    ),
  ];

  for (const outPath of outputPaths) {
    await Bun.write(
      outPath,
      await formatSource("api-schema.d.ts", rawContents),
    );
    console.log(`OpenAPI types successfully generated at ${outPath}`);
  }

  // 3. Extract and write runtime enums
  const rawEnums = extractRuntimeEnums(
    document as unknown as Record<string, unknown>,
  );

  const enumOutputPaths = [
    path.resolve(import.meta.dirname, "../../admin/src/types/api-enums.ts"),
    path.resolve(
      import.meta.dirname,
      "../../storefront/src/types/api-enums.ts",
    ),
  ];

  for (const enumPath of enumOutputPaths) {
    await Bun.write(enumPath, await formatSource("api-enums.ts", rawEnums));
    console.log(`OpenAPI runtime enums successfully generated at ${enumPath}`);
  }
}

generate().catch((err: unknown) => {
  console.error("Failed to generate OpenAPI types:", err);
  process.exit(1);
});
