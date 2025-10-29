import * as vscode from 'vscode';

export class StorageManager {
  constructor(private context: vscode.ExtensionContext) {}

  get<T>(key: string, defaultValue?: T): T {
    return this.context.globalState.get(key, defaultValue as T);
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.context.globalState.update(key, value);
  }

  async remove(key: string): Promise<void> {
    await this.context.globalState.update(key, undefined);
  }

  keys(): readonly string[] {
    return this.context.globalState.keys();
  }
}
