import path from "node:path";
import openapiTS, { astToString } from "openapi-typescript";
import { format } from "oxfmt";

/**
 * CLI script to pull openapi.json from remote/local backend and generate both:
 * 1. src/types/api-schema.d.ts (via openapi-typescript)
 * 2. src/types/api-enums.ts (runtime constants)
 */

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

async function pull() {
  const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";
  const openapiUrl = `${backendUrl.replace(/\/+$/, "")}/openapi.json`;

  console.log(`Pulling OpenAPI specification from ${openapiUrl}...`);
  const res = await fetch(openapiUrl);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch openapi.json: ${res.status} ${res.statusText}`,
    );
  }

  const doc = (await res.json()) as Record<string, unknown>;

  // 1. Generate TypeScript definitions
  const ast = await openapiTS(
    doc as unknown as Parameters<typeof openapiTS>[0],
  );
  const rawTypes = astToString(ast);

  const schemaPath = path.resolve(process.cwd(), "src/types/api-schema.d.ts");
  await Bun.write(schemaPath, await formatSource("api-schema.d.ts", rawTypes));
  console.log(`Generated types at ${schemaPath}`);

  // 2. Extract runtime enums
  const rawEnums = extractRuntimeEnums(doc);

  const enumsPath = path.resolve(process.cwd(), "src/types/api-enums.ts");
  await Bun.write(enumsPath, await formatSource("api-enums.ts", rawEnums));
  console.log(`Generated runtime enums at ${enumsPath}`);
}

function extractRuntimeEnums(doc: Record<string, unknown>): string {
  const components = (doc.components ?? {}) as Record<string, unknown>;
  const schemas = (components.schemas ?? {}) as unknown as Record<
    string,
    Record<string, unknown> | undefined
  >;

  const TARGET_ENUMS = [
    { constant: "USER_ROLES", schema: "UserResponseDto", prop: "role" },
    {
      constant: "BUSINESS_TYPES",
      schema: "UserResponseDto",
      prop: "dealerCompany",
      subProp: "businessType",
    },
    { constant: "USER_STATUSES", schema: "UserResponseDto", prop: "status" },
    { constant: "ORDER_STATUSES", schema: "OrderResponseDto", prop: "status" },
    {
      constant: "ORDER_PAYMENT_STATUSES",
      schema: "OrderResponseDto",
      prop: "paymentStatus",
    },
    {
      constant: "ORDER_PAYMENT_METHODS",
      schema: "OrderResponseDto",
      prop: "paymentMethod",
    },
    {
      constant: "ORDER_APPROVAL_STATUSES",
      schema: "OrderResponseDto",
      prop: "approvalStatus",
    },
    {
      constant: "QUOTE_STATUSES",
      schema: "AdminQuoteResponseDto",
      prop: "status",
    },
    { constant: "LEAD_STATUSES", schema: "LeadResponseDto", prop: "status" },
  ];

  function extractEnumFromProperty(propObj: unknown): string[] | null {
    if (!propObj || typeof propObj !== "object") return null;
    const p = propObj as Record<string, unknown>;

    if (Array.isArray(p.enum) && p.enum.every((v) => typeof v === "string")) {
      return p.enum;
    }

    const variants = (p.anyOf ?? p.oneOf) as unknown[];
    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (v && typeof v === "object") {
          const res = extractEnumFromProperty(v);
          if (res) return res;
        }
      }
    }

    return null;
  }

  const results: Record<string, string[]> = {};

  for (const target of TARGET_ENUMS) {
    const schema = schemas[target.schema];
    if (!schema) continue;

    const properties = (schema.properties ?? {}) as Record<
      string,
      Record<string, unknown> | undefined
    >;
    const propNode = properties[target.prop];
    if (!propNode) continue;

    if (target.subProp) {
      const subVariants = (propNode.anyOf ?? [propNode]) as unknown[];
      let found: string[] | null = null;

      for (const sub of subVariants) {
        if (!sub || typeof sub !== "object") continue;
        const subProps = ((sub as Record<string, unknown>).properties ??
          {}) as Record<string, unknown>;
        const subNode = subProps[target.subProp];
        found = extractEnumFromProperty(subNode);
        if (found) break;
      }

      if (found) {
        results[target.constant] = found;
      }
    } else {
      const found = extractEnumFromProperty(propNode);
      if (found) {
        results[target.constant] = found;
      }
    }
  }

  const lines: string[] = [
    "/**",
    " * AUTO-GENERATED RUNTIME CONSTANTS FROM OPENAPI SPECIFICATION",
    " * Do not edit directly. Re-run `bun run types:sync` or `bun run types:pull`.",
    " */",
    "",
  ];

  for (const [constantName, values] of Object.entries(results)) {
    lines.push(`export const ${constantName} = [`);
    for (const val of values) {
      lines.push(`  ${JSON.stringify(val)},`);
    }
    lines.push(`] as const;`);
    lines.push(
      `export type ${toPascalCase(constantName)}Type = (typeof ${constantName})[number];`,
    );
    lines.push("");
  }

  return lines.join("\n");
}

function toPascalCase(str: string): string {
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

pull().catch((err) => {
  console.error(err);
  process.exit(1);
});
