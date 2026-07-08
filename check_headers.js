async function run() {
  try {
    const res = await fetch('https://ansan-admin-portal.vercel.app/api/get-complaints?currentMode=basement');
    console.log("STATUS:", res.status);
    console.log("STATUS TEXT:", res.statusText);
    for (const [key, value] of res.headers.entries()) {
      console.log(`${key}: ${value}`);
    }
  } catch (err) {
    console.error(err);
  }
}
run();
