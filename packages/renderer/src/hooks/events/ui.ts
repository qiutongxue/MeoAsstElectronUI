/**
 * @file hooks/events/ui.ts
 * @description ui人机交互钩子
 */

export default function useUiHooks() {
  window.ipcRenderer.on("ui:message", async (event, arg) => {
    // ? 是否需要用string包裹防止xss
    event.returnValue = window.$message.create(String(arg.message), {
      type: arg.type
    });
  });
}