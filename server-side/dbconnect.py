import mysql.connector


class DBConnector(object):
    connection = None

    def get_connection(cls, new=False):
        """Creates return new Singleton database connection"""
        if new or not cls.connection:
            cls.connection = DBConnector().create_connection()
        return cls.connection

    @classmethod
    def execute_query(cls, query, values):
        """execute query on singleton db connection"""
        connection = cls.get_connection(cls)
        try:
            cursor = connection.cursor()
        except pyodbc.ProgrammingError:
            connection = cls.get_connection(new=True)  # Create new connection
            cursor = connection.cursor()

        cursor.execute(query, values)
        result = cursor.fetchall()
        cursor.close()
        return result

    def create_connection(self):
        return mysql.connector.connect(user='root',
                                       password='GRpP@&#^4n*6tz*g%E#f',
                                       host='localhost',
                                       database='sample_schema')

    @classmethod
    def commit_database(cls):
        connection = cls.get_connection(cls)
        connection.commit()
