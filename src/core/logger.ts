export function log(value: any, obj?: any) {
  if (obj) {
    const _obj = JSON.stringify(obj, null, 2);
    console.log(value, _obj);
    return;
  }
  console.log(value);
}
