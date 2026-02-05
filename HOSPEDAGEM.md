# 🌐 Opções de Hospedagem GRATUITA

## ✅ Surge.sh (FUNCIONANDO)
**URL**: https://assistente-operacional.surge.sh
**Status**: ✅ ATIVO

### Deploy:
```bash
cd apps/mobile
npx expo export --platform web
cd dist
Copy-Item index.html 200.html
npx surge . --domain assistente-operacional.surge.sh
```

**Limites**: Ilimitado, gratuito para sempre

---

## 🚀 Netlify (RECOMENDADO - Melhor opção)

### Por que Netlify?
- ✅ 100GB largura de banda/mês GRÁTIS
- ✅ Deploy automático do GitHub
- ✅ HTTPS grátis
- ✅ Redirects automáticos
- ✅ Melhor performance que Surge.sh

### Como fazer deploy:

1. **Criar conta**: https://netlify.com (use sua conta GitHub)

2. **Criar novo site**:
   - Click "Add new site" → "Import an existing project"
   - Conecte seu GitHub: `Eduardopjt/assistente-operacional`
   
3. **Configurações de build**:
   ```
   Base directory: apps/mobile
   Build command: npx expo export --platform web
   Publish directory: apps/mobile/dist
   ```

4. **Deploy!** - URL será tipo: `assistente-operacional.netlify.app`

**Pronto!** Qualquer push no GitHub faz deploy automático.

---

## ⚡ Vercel (Alternativa - Muito rápido)

### Como fazer deploy:

1. **Instalar Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login**:
```bash
vercel login
```

3. **Deploy**:
```bash
cd apps/mobile
npx expo export --platform web
cd dist
vercel --prod
```

**URL**: `assistente-operacional.vercel.app` (ou custom domain)

---

## 📦 Cloudflare Pages (Ilimitado)

### Como fazer deploy:

1. **Criar conta**: https://pages.cloudflare.com

2. **Conectar GitHub**: `Eduardopjt/assistente-operacional`

3. **Configurações**:
   ```
   Framework preset: None
   Build command: cd apps/mobile && npx expo export --platform web
   Build output directory: apps/mobile/dist
   ```

4. **Deploy!** - URL: `assistente-operacional.pages.dev`

**Limites**: ILIMITADO largura de banda! 🔥

---

## 🎯 RECOMENDAÇÃO

Para você, sugiro:

1. **Netlify** - Melhor custo-benefício, 100GB/mês grátis
2. **Cloudflare Pages** - Se ultrapassar 100GB (ilimitado)
3. **Surge.sh** - Backup rápido (já está usando)

---

## 📊 Comparação

| Plataforma | Largura Banda | Deploy Auto | HTTPS | Custom Domain |
|------------|---------------|-------------|-------|---------------|
| **Netlify** | 100GB/mês | ✅ | ✅ | ✅ |
| **Vercel** | 100GB/mês | ✅ | ✅ | ✅ |
| **Cloudflare** | ILIMITADO | ✅ | ✅ | ✅ |
| **Surge.sh** | Ilimitado | ❌ Manual | ✅ | ✅ Pro ($30/mês) |
| **GitHub Pages** | 100GB/mês | ✅ | ✅ | ✅ |

---

## 🔥 Deploy AGORA no Netlify (5 minutos)

1. Acesse: https://app.netlify.com/start
2. Click "Import from Git"
3. Escolha GitHub → `assistente-operacional`
4. Configure:
   - Build command: `cd apps/mobile && npx expo export --platform web`
   - Publish directory: `apps/mobile/dist`
5. Click "Deploy site"

**Pronto!** URL: `https://[seu-site].netlify.app`

Para custom domain (exemplo: assistente.com.br), só adicionar nas configurações.
