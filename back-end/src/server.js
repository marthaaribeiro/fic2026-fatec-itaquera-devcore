import app from './index.js';
import connection from './models/connection.js';

try{
    await connection.authenticate();
    await connection.sync();
    console.log("Banco pronto");
    app.listen(3000, ()=>{
        console.log("Conexão feita e rodando em 3000");
    });
}catch(error){
    console.log("Erro:", error.message);
}
