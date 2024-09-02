document.addEventListener('DOMContentLoaded', () => {
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    try {
      const url = new URL(tabs[0].url);
      const sitemapUrl = `${url.origin}/sitemap.xml`;
      const linksContainer = document.getElementById('links');
      processUrl(sitemapUrl, linksContainer);
    } catch {
      printError(linksContainer);
    }
  });

  function processUrl(sitemapUrl, linksContainer) {
    fetch(sitemapUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error();
        }
        return response.text();
      })
      .then(data => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'text/xml');
        const urls = xmlDoc.getElementsByTagName('loc');
        
        Array.from(urls).forEach(urlElement => {
          const link = urlElement.textContent;
          const linkElement = document.createElement('a');
          linkElement.href = link;
          linkElement.textContent = link;
          linksContainer.appendChild(linkElement);
  
          if (link.endsWith('.xml')) {
            processUrl(link, linksContainer);
          }
        });
      })
      .catch(() => {
        if (linksContainer.childElementCount === 0) {
          printError(linksContainer);
        }
      });
  }

  function printError() {
    const linksContainer = document.getElementById('links');
    linksContainer.innerHTML = `
    <div id="error-message-container">
      <div class="error-message">
        <strong>Error:</strong> Unable to fetch sitemap.<br>
        The website may not have a traditional sitemap. Please check the domain or try another website.
      </div>
    </div>
    `;
  }

  document.getElementById('copy-button').addEventListener('click', () => {
    const copyImage = document.getElementById('copy-image');
    const linksText = document.getElementById('links').innerText.trim();
    
    navigator.clipboard.writeText(linksText)
    .then(() => {
      copyImage.src = 'images/copied.png';
      setTimeout(() => {
        copyImage.src = 'images/copy.png';
      }, 5000);
    })
  });

  document.getElementById('export-button').addEventListener('click', () => {
    const linksText = document.getElementById('links').innerText.trim();
    const blob = new Blob([linksText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'sitemap-links.txt';
    a.click();
    URL.revokeObjectURL(url);
  });

});
