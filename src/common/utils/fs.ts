import * as fs from 'fs'
import * as path from 'path'

export function findFiles(rootPath: string, depth: number): string[] {
    const foundFiles: string[] = []

    function walkDir(currentPath: string, currentDepth: number) {
        if (currentDepth > depth) {
            return
        }

        const files = fs.readdirSync(currentPath)

        for (const file of files) {
            const filePath = path.join(currentPath, file)
            const stats = fs.statSync(filePath)

            if (stats.isDirectory()) {
                walkDir(filePath, currentDepth + 1)
            } else if (stats.isFile()) {
                foundFiles.push(path.relative(rootPath, filePath))
            }
        }
    }

    walkDir(rootPath, 0)

    return foundFiles
}
