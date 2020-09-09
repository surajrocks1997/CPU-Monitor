const path = require('path');
const osu = require('node-os-utils');
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let cpuOverload = 80;

// Run every 2 seconds
setInterval(() => {
  // cpu usage
  cpu.usage().then((info) => {
    document.getElementById('cpu-usage').innerHTML = info + '%';

    document.getElementById('cpu-progress').style.width = info + '%';

    // Make progress bar red if overload
    if (info > cpuOverload) {
      document.getElementById('cpu-progress').style.background = 'red';
    } else {
      document.getElementById('cpu-progress').style.background = '#30c88b';
    }
  });

  // cpu free
  cpu.free().then((info) => {
    document.getElementById('cpu-free').innerText = info + '%';
  });

  // uptime
  // console.log(os.uptime());
  document.getElementById('sys-uptime').innerText = secondsToDHMS(os.uptime());
}, 1500);

// set model
document.getElementById('cpu-model').innerText = cpu.model();

// computer name
document.getElementById('comp-name').innerText = os.hostname();

// OS
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`;

// Total mem
mem.info().then((info) => {
  document.getElementById('mem-total').innerText = `${info.totalMemMb} GB`;
});

const secondsToDHMS = (seconds) => {
  seconds = +seconds;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
};
