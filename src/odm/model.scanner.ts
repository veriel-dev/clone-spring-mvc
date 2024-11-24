// database/model.scanner.ts
import fs from 'fs';
import path from 'path';
import { BaseDocument } from './base-document';
import { ModelConstructor, ModelsRegistry } from './models.registry';

export class ModelScanner {
    static async scanAndRegisterModels(basePath: string = 'src'): Promise<void> {
        const modelFiles = await this.findModelFiles(basePath);
        
        for (const file of modelFiles) {
            try {
                // Importar dinámicamente el archivo
                const module = await import(file);
                
                // Registrar cada clase exportada que extienda BaseDocument
                Object.values(module).forEach(exportedItem => {
                    if (
                        typeof exportedItem === 'function' &&
                        exportedItem.prototype instanceof BaseDocument
                    ) { 
                        const modelClass = exportedItem as ModelConstructor<BaseDocument>;
                        // Intentar crear una instancia para validar
                        try {
                            new modelClass();
                            ModelsRegistry.register(modelClass);
                            console.log(`Registered model from ${path.basename(file)}`);
                        } catch (error) {
                            console.error(`Invalid model constructor in ${file}:`, error);
                        }
                    }
                });
            } catch (error) {
                console.error(`Error loading model from ${file}:`, error);
            }
        }
    }

    private static async findModelFiles(
        dir: string,
        fileList: string[] = []
    ): Promise<string[]> {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Recursivamente buscar en subdirectorios
                await this.findModelFiles(filePath, fileList);
            } else if (
                // Buscar archivos que terminen en .model.ts o .model.js
                file.match(/\.model\.(ts|js)$/) &&
                !file.endsWith('.d.ts') // Ignorar archivos de declaración
            ) {
                // Convertir a ruta relativa para import dinámico
                const relativePath = path.relative(__dirname, filePath);
                fileList.push(path.join(__dirname, relativePath));
            }
        }

        return fileList;
    }
}