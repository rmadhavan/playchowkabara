# Play Chowka Bara

A mobile-first browser version of Chowka Bara, the traditional South Indian race game played with cowrie shells.

## Play locally

Open `index.html` directly, or serve the repository:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Deployment

The site is deployed with GitHub Pages from the `main` branch and uses the custom domain [playchowkabara.com](https://playchowkabara.com).

DNS records for the apex domain:

| Type | Host | Value |
| --- | --- | --- |
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `CNAME` | `www` | `rmadhavan.github.io` |

GitHub Pages reads the custom domain from `CNAME`. HTTPS can be enforced after DNS propagation completes.
