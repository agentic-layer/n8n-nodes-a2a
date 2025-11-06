#!/usr/bin/env node

const { compileFromFile } = require('json-schema-to-typescript');
const fs = require('fs');
const path = require('path');

async function generateTypes() {
	const schemaPath = path.join(__dirname, '../types/a2a/schema.json');
	const outputPath = path.join(__dirname, '../types/a2a/index.ts');

	console.log('🔧 Generating TypeScript types from A2A schema...');

	try {
		const ts = await compileFromFile(schemaPath, {
			bannerComment: `/**
 * This file was automatically generated from the A2A (Agent-to-Agent) JSON Schema.
 * DO NOT MODIFY IT BY HAND. Instead, modify the schema file and regenerate.
 *
 * To regenerate: npm run generate:types
 * To update schema: npm run update:schema
 */`,
			unreachableDefinitions: true, // Generate all definitions, even if not referenced
			additionalProperties: false, // Strict type checking - no extra properties
			style: {
				semi: true,
				singleQuote: true,
				tabWidth: 2,
			},
		});

		fs.writeFileSync(outputPath, ts);
		console.log('✅ Successfully generated types at:', outputPath);
	} catch (error) {
		console.error('❌ Error generating types:', error.message);
		process.exit(1);
	}
}

generateTypes();
