import sqlite3
from typing import List, Tuple, Optional
import datetime

DATABASE_NAME = 'tasks.db'

def create_connection():
    """Create a database connection to the SQLite database."""
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_NAME)
        print(f"Connection to {DATABASE_NAME} successful")
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
    return conn

def create_table():
    """Create the tasks table if it doesn't exist."""
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    due_date DATE,
                    completed BOOLEAN DEFAULT FALSE
                );
            """)
            conn.commit()
            print("Table created successfully")
        except sqlite3.Error as e:
            print(f"Error creating table: {e}")
        finally:
            conn.close()

def create_task(title: str, description: str = None, due_date: str = None) -> int:
    """Create a new task."""
    conn = create_connection()
    task_id = None
    if conn is not None:
        try:
            cursor = conn.cursor()
            # Convert due_date to 'YYYY-MM-DD' format if it's provided
            if due_date:
                try:
                    due_date = datetime.datetime.strptime(due_date, '%Y-%m-%d').strftime('%Y-%m-%d')
                except ValueError:
                    print("Invalid date format. Please use YYYY-MM-DD.")
                    return None
            cursor.execute("""
                INSERT INTO tasks (title, description, due_date) VALUES (?, ?, ?)
            """, (title, description, due_date))
            conn.commit()
            task_id = cursor.lastrowid
            print(f"Task created with id: {task_id}")
        except sqlite3.Error as e:
            print(f"Error creating task: {e}")
        finally:
            conn.close()
    return task_id

def get_task(task_id: int) -> Optional[Tuple]:
    """Get a task by id."""
    conn = create_connection()
    task = None
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM tasks WHERE id = ?
            """, (task_id,))
            task = cursor.fetchone()
        except sqlite3.Error as e:
            print(f"Error getting task: {e}")
        finally:
            conn.close()
    return task

def get_all_tasks() -> List[Tuple]:
    """Get all tasks."""
    conn = create_connection()
    tasks = []
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM tasks
            """)
            tasks = cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Error getting all tasks: {e}")
        finally:
            conn.close()
    return tasks

def update_task(task_id: int, title: str = None, description: str = None, due_date: str = None, completed: bool = None) -> bool:
    """Update an existing task."""
    conn = create_connection()
    updated = False
    if conn is not None:
        try:
            cursor = conn.cursor()
            # Construct the update query dynamically based on provided arguments
            update_fields = []
            update_values = []
            if title is not None:
                update_fields.append("title = ?")
                update_values.append(title)
            if description is not None:
                update_fields.append("description = ?")
                update_values.append(description)
            if due_date is not None:
                # Convert due_date to 'YYYY-MM-DD' format if it's provided
                try:
                    due_date = datetime.datetime.strptime(due_date, '%Y-%m-%d').strftime('%Y-%m-%d')
                    update_fields.append("due_date = ?")
                    update_values.append(due_date)
                except ValueError:
                    print("Invalid date format. Please use YYYY-MM-DD.")
                    return False
            if completed is not None:
                update_fields.append("completed = ?")
                update_values.append(completed)

            if update_fields:
                query = f"UPDATE tasks SET {', '.join(update_fields)} WHERE id = ?"
                update_values.append(task_id)  # Add task_id to the end
                cursor.execute(query, update_values)
                conn.commit()
                updated = cursor.rowcount > 0
                print(f"Task with id {task_id} updated successfully")
            else:
                print("No fields to update provided.")

        except sqlite3.Error as e:
            print(f"Error updating task: {e}")
        finally:
            conn.close()
    return updated

def delete_task(task_id: int) -> bool:
    """Delete a task by id."""
    conn = create_connection()
    deleted = False
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                DELETE FROM tasks WHERE id = ?
            """, (task_id,))
            conn.commit()
            deleted = cursor.rowcount > 0
            print(f"Task with id {task_id} deleted successfully")
        except sqlite3.Error as e:
            print(f"Error deleting task: {e}")
        finally:
            conn.close()
    return deleted

if __name__ == '__main__':
    create_table()

    # Example Usage
    task_id1 = create_task("Grocery Shopping", "Buy milk, eggs, and bread", "2024-08-10")
    task_id2 = create_task("Laundry", "Wash all clothes")

    print(f"Task 1: {get_task(task_id1)}")
    print(f"Task 2: {get_task(task_id2)}")

    print(f"All Tasks: {get_all_tasks()}")

    update_task(task_id1, completed=True)
    print(f"Task 1 after update: {get_task(task_id1)}")

    delete_task(task_id2)
    print(f"All Tasks after deletion: {get_all_tasks()}")
