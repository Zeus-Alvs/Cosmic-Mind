

O **Cosmic Mind** é uma plataforma de monitoramento de desempenho cognitivo, projetada para integrar dados de jogos mobile e apresentar análises detalhadas para tutores e especialistas.

## Instalação e Inicialização

Certifique-se de ter o **Node.js** e o **Python 3.10+** instalados em sua máquina.

### 1. Front-end (Next.js)

Navegue até a pasta do front-end e instale as dependências:

```Terminal
cd frontend
npm install
npm install lucide-react
npm run dev
```

### 2. Back-end (FastAPI)

Abra um novo terminal na pasta do back-end, configure o ambiente virtual e instale as dependências:

```Terminal
cd backend
python -m venv venv

# No Windows:
.\venv\Scripts\activate

# No Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload

```

---

## Configuração do Ambiente (.env)

O sistema exige variáveis de ambiente para a conexão com o banco de dados e disparo de e-mails. Crie um arquivo `.env` dentro da pasta `backend/` com a seguinte estrutura:

```env
# Conexão com o MongoDB Atlas
MONGO_URL=sua_url_de_conexao_aqui

# Configuração de E-mail (Gmail SMTP)
EMAIL_REMETENTE=seu-email@gmail.com
EMAIL_SENHA=sua_senha_de_app_aqui

```

---

## ⚠️ Notas Importantes

### Erros de Compilação (Turbopack)

Para evitar erros de compilação no motor **Turbopack (Rust)**, **nunca** salve o projeto em caminhos de diretório que contenham acentos ou caracteres especiais.

* **Errado:** `C:\Users\João\Área de Trabalho\Cosmic Mind`
* **Correto:** `C:\Projetos\Cosmic-Mind`

### Restrições de Rede (Firewall)

Redes corporativas ou institucionais possuem firewalls que podem bloquear a conexão com o MongoDB Atlas (porta 27017).

* Caso enfrente erros de `Timeout` ou `Network Error`, tente utilizar o roteador do seu celular (4G/5G).

---

## Tecnologias Utilizadas

* **Front-end:** [Next.js](https://nextjs.org/) (Turbopack), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/).
* **Back-end:** [FastAPI](https://fastapi.tiangolo.com/), [Pydantic](https://www.google.com/search?q=https://docs.pydantic.dev/).
* **Banco de Dados:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
* **Segurança:** [Bcrypt](https://pypi.org/project/bcrypt/) para hashing de senhas.