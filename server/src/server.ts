import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import { errors } from 'celebrate';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);


app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(errors());

app.listen(3333);
// npm run dev
// Rota: Endereço completo da requisição
// Recurso: Qual entidade estamos acessando do sistema

// GET: Buscar uma ou mais informações do back-end
// POST: Criar uma nova informação no back end
// PUT: Atualizar uma informação existente no back-end
// DELTE: Remover uma informação do back-end

// POST: https://localhost:3333/users = Criar um usuário
// GET: https://localhost:3333/users = Listar usuários
// GET: https://localhost:3333/users/ = Buscar dados do usuário com ID 5

// Reuqest Param: Parâmetros que vem na propria rota que identificam um recurso
// Query Param: Parâmetors que vem na própria rota geralmente opcionais para filtros, paginação
// Request Body: Parâmetros para criação/atualização de infomações 

// usar o sqlite com uso de query com knex.js permite criar query em js
// SELECT * FROM users WHERE name = 'Daniel
// knex('users').where('name','Daniel').select('*')

