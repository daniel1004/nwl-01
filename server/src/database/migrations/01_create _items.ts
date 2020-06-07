import Knex from 'knex';

export async function up(knex: Knex){
    // Realizar as alteração no banco
    // Criar a tabela
    return knex.schema.createTable('items', table => {
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('title').notNullable();
    });
}

export async function down(knex: Knex){
    return knex.schema.dropTable('items');
    //Volar atras(deletear a tabela criada)
}