export function isValidStr(value: string | undefined): value is string {
  return value !== undefined
}
export default isValidStr
