export function actionToObject (json) {
  try {
    return JSON.parse(json)
  } catch (e) {
  }
  return []
}
