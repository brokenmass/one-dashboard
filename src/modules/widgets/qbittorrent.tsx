'use client';

import {WidgetModule, registerWidget} from '.';

function QbitWidget() {
  // Placeholder: later call an API route to fetch speed from qBittorrent
  return (
    <div className='text-sm'>
      <div className='font-medium mb-1'>qBittorrent</div>
      <div className='opacity-80'>Down: 0 MB/s • Up: 0 MB/s</div>
      <button className='mt-2 px-2 py-1 rounded bg-white/10 hover:bg-white/20'>
        Pause All
      </button>
    </div>
  );
}

const mod: WidgetModule = {
  key: 'qbittorrent',
  title: 'qBittorrent',
  Component: QbitWidget,
};

registerWidget(mod);

export default mod;
