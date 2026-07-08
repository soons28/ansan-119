async function run() {
  try {
    const res = await fetch('https://ansan-admin-portal.vercel.app/api/get-complaints?currentMode=basement');
    const status = res.status;
    const text = await res.text();
    console.log("STATUS:", status);
    console.log("RESPONSE:", text);
  } catch (err) {
    console.error(err);
  }
}
run();
