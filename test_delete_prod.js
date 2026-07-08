async function run() {
  try {
    const res = await fetch('https://ansan-admin-portal.vercel.app/api/delete-complaint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        index: 0,
        pin: '1234',
        currentMode: 'basement'
      })
    });
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", await res.text());
  } catch (err) {
    console.error(err);
  }
}
run();
