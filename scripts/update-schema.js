#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCHEMA_URL =
	'https://raw.githubusercontent.com/a2aproject/A2A/refs/heads/main/specification/json/a2a.json';
const SCHEMA_PATH = path.join(__dirname, '../types/a2a/schema.json');

function downloadSchema() {
	return new Promise((resolve, reject) => {
		console.log('📥 Downloading latest A2A schema from GitHub...');

		https
			.get(SCHEMA_URL, (response) => {
				if (response.statusCode !== 200) {
					reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
					return;
				}

				let data = '';
				response.on('data', (chunk) => (data += chunk));
				response.on('end', () => {
					try {
						// Validate JSON
						JSON.parse(data);
						resolve(data);
					} catch (error) {
						reject(new Error(`Invalid JSON received: ${error.message}`));
					}
				});
			})
			.on('error', reject);
	});
}

async function updateSchema() {
	try {
		// Download new schema
		const newSchema = await downloadSchema();

		// Check if schema has changed
		if (fs.existsSync(SCHEMA_PATH)) {
			const oldSchema = fs.readFileSync(SCHEMA_PATH, 'utf8');
			if (oldSchema === newSchema) {
				console.log('ℹ️  Schema is already up to date.');
				return;
			}
		}

		// Save new schema
		fs.writeFileSync(SCHEMA_PATH, newSchema);
		console.log('✅ Schema updated successfully at:', SCHEMA_PATH);

		// Regenerate types
		console.log('\n🔄 Regenerating TypeScript types...');
		execSync('npm run generate:types', { stdio: 'inherit' });

		console.log('\n✨ Schema update complete!');
		console.log('⚠️  Remember to commit the updated schema.json and index.ts files.');
	} catch (error) {
		console.error('❌ Error updating schema:', error.message);
		process.exit(1);
	}
}

updateSchema();
