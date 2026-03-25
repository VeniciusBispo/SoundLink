const YouTube = require('youtube-sr').default;

async function test() {
  const listId = 'PLj8-LSB6lOxhd5aUNlSlogot8N2Ub4n8-';
  const url = `https://www.youtube.com/playlist?list=${listId}`;
  try {
    const listIdWithHyphen = 'PLj8-LSB6lOxhd5aUNlSlogot8N2Ub4n8-';
    const listIdWithoutHyphen = 'PLj8-LSB6lOxhd5aUNlSlogot8N2Ub4n8';
    
    for (const id of [listIdWithHyphen, listIdWithoutHyphen]) {
        console.log(`\nTesting ID: ${id}`);
        try {
            const playlist = await YouTube.getPlaylist(id, { fetchAll: false });
            console.log(`Success for ${id}:`, !!playlist);
            if (playlist) console.log('Title:', playlist.title);
        } catch (e) {
            console.log(`Error for ${id}:`, e.message);
        }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
