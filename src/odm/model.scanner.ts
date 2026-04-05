import fs from 'fs';
import path from 'path';
import { BaseDocument } from './base-document';
import { ModelConstructor, ModelsRegistry } from './models.registry';

export class ModelScanner {
    static async scanAndRegisterModels(basePath: string): Promise<void> {
        const modelFiles = await this.findModelFiles(basePath);

        for (const file of modelFiles) {
            try {
                const module = await import(file);

                Object.values(module).forEach(exportedItem => {
                    if (
                        typeof exportedItem === 'function' &&
                        exportedItem.prototype instanceof BaseDocument
                    ) {
                        const modelClass = exportedItem as ModelConstructor<BaseDocument>;
                        try {
                            new modelClass();
                            ModelsRegistry.register(modelClass);
                        } catch {
                            // Skip invalid model constructors
                        }
                    }
                });
            } catch {
                // Skip files that fail to load
            }
        }
    }

    private static async findModelFiles(
        dir: string,
        fileList: string[] = []
    ): Promise<string[]> {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.resolve(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                await this.findModelFiles(filePath, fileList);
            } else if (
                file.match(/\.model\.(ts|js)$/) &&
                !file.endsWith('.d.ts')
            ) {
                fileList.push(filePath);
            }
        }

        return fileList;
    }
}
