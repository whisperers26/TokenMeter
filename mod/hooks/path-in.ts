/**
 * A path under `dir`, joined with the separator `dir` itself is spelled
 * with: a backslash for a Windows path, a slash otherwise.
 *
 * A hooks module has no `path` to import, and the paths it builds are handed
 * to the host's own file system and to child processes, which read either.
 *
 * @param dir the directory, absolute
 * @param names the folders and the file beneath it, in order
 * @returns the joined path
 */
export function pathIn(dir: string, ...names: string[]): string {
  return [dir, ...names].join(dir.includes('\\') ? '\\' : '/')
}
