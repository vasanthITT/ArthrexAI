"""
Arthrex AI — Backend Server
Flask + SQLite database
Production: gunicorn server:app
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3, os, json, hashlib
from datetime import datetime

app = Flask(__name__, static_folder='.')
CORS(app, origins="*")

# Local: save next to server.py. Production (Render): use /tmp
DB_PATH = os.environ.get('DB_PATH', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'arthrex.db'))

# ─────────────────────────────────────────────
#  DATABASE INIT
# ─────────────────────────────────────────────
def hash_password(password):
    """SHA-256 hash for passwords. Not bcrypt but far better than plaintext."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(password, stored):
    """Verify password against stored hash or legacy plaintext."""
    if stored.startswith('sha256:'):
        return stored == 'sha256:' + hashlib.sha256(password.encode()).hexdigest()
    return stored == password or hash_password(password) == stored

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    # Users / Signups
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        name      TEXT NOT NULL,
        email     TEXT UNIQUE NOT NULL,
        password  TEXT NOT NULL,
        country   TEXT,
        phone     TEXT,
        role      TEXT DEFAULT 'user',
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # Enrollments
    c.execute('''CREATE TABLE IF NOT EXISTS enrollments (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT,
        email      TEXT,
        phone      TEXT,
        course     TEXT,
        course_id  TEXT,
        status     TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # LMS Courses
    c.execute('''CREATE TABLE IF NOT EXISTS lms_courses (
        id         TEXT PRIMARY KEY,
        name       TEXT NOT NULL,
        category   TEXT,
        duration   TEXT,
        data       TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # Masterclasses
    c.execute('''CREATE TABLE IF NOT EXISTS masterclasses (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        title      TEXT,
        tag        TEXT,
        instructor TEXT,
        description TEXT,
        schedule   TEXT,
        duration   TEXT,
        link       TEXT,
        rating     REAL DEFAULT 4.9,
        thumb      TEXT,
        video_url  TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # Live Classes
    c.execute('''CREATE TABLE IF NOT EXISTS live_classes (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        title       TEXT,
        tag         TEXT,
        instructor  TEXT,
        description TEXT,
        schedule    TEXT,
        date        TEXT,
        start_time  TEXT,
        end_time    TEXT,
        duration    TEXT,
        join_link   TEXT,
        thumb       TEXT,
        created_at  TEXT DEFAULT (datetime('now','localtime'))
    )''')
    # Migrate: add schedule column to existing live_classes table if missing
    try:
        c.execute("ALTER TABLE live_classes ADD COLUMN schedule TEXT")
        conn.commit()
    except Exception:
        pass  # column already exists

    # Seed admin user
    c.execute("INSERT OR IGNORE INTO users (name,email,password,role) VALUES (?,?,?,?)",
              ('Admin', 'admin@arthrex.ai', 'admin123', 'admin'))
    c.execute("INSERT OR IGNORE INTO users (name,email,password,role) VALUES (?,?,?,?)",
              ('User', 'user@arthrex.ai', 'user123', 'user'))

    conn.commit()
    conn.close()
    print("✅ Database initialized: arthrex.db")

# ─────────────────────────────────────────────
#  SERVE FRONTEND
# ─────────────────────────────────────────────
@app.route('/')
def index():
    response = send_from_directory('.', 'index.html')
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    return response

@app.route('/admin')
def admin():
    response = send_from_directory('.', 'admin.html')
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    return response

@app.route('/admin-lms')
def admin_lms():
    response = send_from_directory('.', 'admin-lms.html')
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    return response

@app.route('/lms')
def lms():
    return send_from_directory('.', 'lms.html')

@app.route('/curriculum')
def curriculum():
    return send_from_directory('.', 'curriculum.html')

@app.route('/website')
def website():
    return send_from_directory('.', 'website.html')

@app.route('/<path:path>')
def static_files(path):
    file_path = os.path.join('.', path)
    if os.path.isfile(file_path):
        response = send_from_directory('.', path)
        # Never cache JS, HTML, CSS — always serve fresh
        if path.endswith(('.js', '.html', '.css')):
            response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
        return response
    return send_from_directory('.', 'index.html')

# ─────────────────────────────────────────────
#  AUTH ROUTES
# ─────────────────────────────────────────────
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    d = request.json
    name, email, password = d.get('name','').strip(), d.get('email','').strip().lower(), d.get('password','')
    country, phone = d.get('country',''), d.get('phone','')
    if not name or not email or not password:
        return jsonify({'error': 'All fields required'}), 400
    try:
        conn = get_db()
        # FIX: store hashed password, not plaintext
        conn.execute("INSERT INTO users (name,email,password,country,phone) VALUES (?,?,?,?,?)",
                     (name, email, 'sha256:' + hash_password(password), country, phone))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'name': name, 'email': email, 'role': 'user'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already registered'}), 409

@app.route('/api/auth/login', methods=['POST'])
def login():
    d = request.json
    email, password = d.get('email','').strip().lower(), d.get('password','')
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    conn.close()
    if not user or not verify_password(password, user['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    return jsonify({'success': True, 'name': user['name'], 'email': user['email'], 'role': user['role']})

# ─────────────────────────────────────────────
#  SIGNUPS (admin view)
# ─────────────────────────────────────────────
@app.route('/api/signups', methods=['GET'])
def get_signups():
    conn = get_db()
    rows = conn.execute("SELECT id,name,email,country,phone,role,created_at FROM users WHERE role='user' ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/signups/<int:uid>', methods=['DELETE'])
def delete_signup(uid):
    conn = get_db()
    conn.execute("DELETE FROM users WHERE id=? AND role='user'", (uid,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ─────────────────────────────────────────────
#  ENROLLMENTS
# ─────────────────────────────────────────────
@app.route('/api/enrollments', methods=['GET'])
def get_enrollments():
    conn = get_db()
    rows = conn.execute("SELECT * FROM enrollments ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/enrollments', methods=['POST'])
def add_enrollment():
    d = request.json
    conn = get_db()
    # FIX: Prevent duplicate enrollment for same email + course
    existing = conn.execute(
        "SELECT id FROM enrollments WHERE email=? AND course=?",
        (d.get('email'), d.get('course'))
    ).fetchone()
    if existing:
        conn.close()
        return jsonify({'error': 'Already enrolled in this course'}), 409
    conn.execute("INSERT INTO enrollments (name,email,phone,course,course_id,status) VALUES (?,?,?,?,?,?)",
                 (d.get('name'), d.get('email'), d.get('phone'), d.get('course'), d.get('courseId',''), 'pending'))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/enrollments/<int:eid>', methods=['PATCH'])
def update_enrollment(eid):
    d = request.json
    conn = get_db()
    conn.execute("UPDATE enrollments SET status=? WHERE id=?", (d.get('status'), eid))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/enrollments/<int:eid>', methods=['DELETE'])
def delete_enrollment(eid):
    conn = get_db()
    conn.execute("DELETE FROM enrollments WHERE id=?", (eid,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ─────────────────────────────────────────────
#  LMS COURSES
# ─────────────────────────────────────────────
@app.route('/api/lms', methods=['GET'])
def get_lms():
    conn = get_db()
    rows = conn.execute("SELECT * FROM lms_courses").fetchall()
    conn.close()
    result = {}
    for r in rows:
        result[r['id']] = {
            'name': r['name'],
            'category': r['category'],
            'duration': r['duration'],
            **json.loads(r['data'] or '{}')
        }
    return jsonify(result)

@app.route('/api/lms/<course_id>', methods=['PUT'])
def save_lms_course(course_id):
    d = request.json
    name = d.get('name', '')
    category = d.get('category', '')
    duration = d.get('duration', '')
    data_json = json.dumps({k: v for k, v in d.items() if k not in ('name','category','duration')})
    conn = get_db()
    conn.execute('''INSERT INTO lms_courses (id,name,category,duration,data)
                    VALUES (?,?,?,?,?)
                    ON CONFLICT(id) DO UPDATE SET name=?,category=?,duration=?,data=?''',
                 (course_id, name, category, duration, data_json,
                  name, category, duration, data_json))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/lms/<course_id>', methods=['DELETE'])
def delete_lms_course(course_id):
    conn = get_db()
    conn.execute("DELETE FROM lms_courses WHERE id=?", (course_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ─────────────────────────────────────────────
#  MASTERCLASS REGISTRATIONS
# ─────────────────────────────────────────────
@app.route('/api/masterclass-registrations', methods=['POST'])
def add_mc_registration():
    d = request.json
    mc_id = d.get('mcId')
    name  = d.get('name', '')
    email = d.get('email', '')
    phone = d.get('phone', '')
    country = d.get('country', '')
    title = d.get('masterclassTitle', '')
    conn = get_db()
    # Create table if not exists
    conn.execute('''CREATE TABLE IF NOT EXISTS mc_registrations (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        mc_id      TEXT,
        name       TEXT,
        email      TEXT,
        phone      TEXT,
        country    TEXT,
        mc_title   TEXT,
        registered_at TEXT
    )''')
    # Prevent duplicate
    existing = conn.execute(
        'SELECT id FROM mc_registrations WHERE mc_id=? AND email=?', (str(mc_id), email)
    ).fetchone()
    if not existing:
        conn.execute(
            'INSERT INTO mc_registrations (mc_id,name,email,phone,country,mc_title,registered_at) VALUES (?,?,?,?,?,?,?)',
            (str(mc_id), name, email, phone, country, title,
             __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        )
        conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/masterclass-registrations/<mc_id>', methods=['GET'])
def get_mc_registrations(mc_id):
    conn = get_db()
    conn.execute('''CREATE TABLE IF NOT EXISTS mc_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mc_id TEXT, name TEXT, email TEXT, phone TEXT,
        country TEXT, mc_title TEXT,
        registered_at TEXT
    )''')
    rows = conn.execute(
        'SELECT * FROM mc_registrations WHERE mc_id=? ORDER BY id DESC', (str(mc_id),)
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route('/api/masterclasses', methods=['GET'])
def get_masterclasses():
    conn = get_db()
    rows = conn.execute("SELECT * FROM masterclasses ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/masterclasses', methods=['POST'])
def add_masterclass():
    d = request.json
    conn = get_db()
    conn.execute('''INSERT INTO masterclasses (title,tag,instructor,description,schedule,duration,link,rating,thumb,video_url)
                    VALUES (?,?,?,?,?,?,?,?,?,?)''',
                 (d.get('title'), d.get('tag'), d.get('instructor'), d.get('description'),
                  d.get('schedule'), d.get('duration'), d.get('link'),
                  d.get('rating', 4.9), d.get('thumb'), d.get('videoUrl')))
    new_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'id': new_id})

@app.route('/api/masterclasses/<int:mid>', methods=['DELETE'])
def delete_masterclass(mid):
    conn = get_db()
    conn.execute("DELETE FROM masterclasses WHERE id=?", (mid,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ─────────────────────────────────────────────
#  LIVE CLASSES
# ─────────────────────────────────────────────
@app.route('/api/liveclasses', methods=['GET'])
def get_liveclasses():
    conn = get_db()
    rows = conn.execute("SELECT * FROM live_classes ORDER BY id DESC").fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        # Expose join_link as both 'link' and 'joinLink'
        d['link']     = d.get('join_link', '') or ''
        d['joinLink'] = d.get('join_link', '') or ''
        # Ensure schedule field is present — build from date+start_time for old rows
        if not d.get('schedule'):
            date_part = d.get('date', '') or ''
            time_part = d.get('start_time', '') or ''
            if date_part and time_part:
                d['schedule'] = f"{date_part}T{time_part}"
            elif date_part:
                d['schedule'] = date_part
        # camelCase aliases for frontend
        d['startTime'] = d.get('start_time', '') or ''
        d['endTime']   = d.get('end_time', '') or ''
        result.append(d)
    return jsonify(result)

@app.route('/api/liveclasses', methods=['POST'])
def add_liveclass():
    d = request.json or {}
    # Admin sends schedule as "YYYY-MM-DDTHH:MM" — also split into date/start_time
    schedule   = d.get('schedule', '')
    date_val   = d.get('date', '') or ''
    start_time = d.get('startTime', '') or ''
    if schedule and not date_val:
        parts      = schedule.split('T')
        date_val   = parts[0]
        start_time = parts[1] if len(parts) > 1 else start_time
    conn = get_db()
    conn.execute(
        '''INSERT INTO live_classes
           (title, tag, instructor, description, schedule, date, start_time, end_time, duration, join_link, thumb)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
        (
            d.get('title'), d.get('tag'), d.get('instructor'), d.get('description'),
            schedule, date_val, start_time,
            d.get('endTime', '') or '', d.get('duration'),
            d.get('joinLink') or d.get('link', ''),
            d.get('thumb', '')
        )
    )
    new_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'id': new_id})

@app.route('/api/liveclasses/<int:lid>', methods=['DELETE'])
def delete_liveclass(lid):
    conn = get_db()
    conn.execute("DELETE FROM live_classes WHERE id=?", (lid,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ─────────────────────────────────────────────
#  RUN
# ─────────────────────────────────────────────
init_db()  # Always run on startup — works for both gunicorn and direct python

if __name__ == '__main__':
    print("Starting Arthrex AI Server at http://localhost:8000")
    app.run(debug=True, port=8000)
