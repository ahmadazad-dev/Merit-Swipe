const express = require("express");
const cors = require("cors");
const sql = require("mssql/msnodesqlv8");
const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
}));

const config = {
  connectionString: "Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=merit_swipe;UID=sa;PWD=123456;Encrypt=Yes;TrustServerCertificate=Yes"
}

let pool;
async function connectDB() {
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log("Connected to database");
  } catch (e) {
    console.log("Error Occured", e);
    process.exit(1);
  }
}
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});

const authenticateToken = (req, res, next) => {
  console.log("hello");
  next();
};

app.get("/deals/filters", authenticateToken, async (req, res) => {
  try {
    const request = pool.request();

    const banksResult = await request.query(
      "SELECT DISTINCT bank_name FROM VW_deal_information WHERE bank_name IS NOT NULL ORDER BY bank_name"
    );

    const categoriesResult = await request.query(
      "SELECT DISTINCT category FROM VW_deal_information WHERE category IS NOT NULL ORDER BY category"
    );

    res.json({
      banks: banksResult.recordset.map((r) => r.bank_name),
      categories: categoriesResult.recordset.map((r) => r.category),
    });
  } catch (err) {
    console.error("Error in GET /deals/filters:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/deals", authenticateToken, async (req, res) => {
  try {
    const { search = "", bank = "", category = "", page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const request = pool.request();
    const conditions = [];

    if (search) {
      request.input("search", `%${search}%`);
      conditions.push("(restaurant_name LIKE @search OR bank_name LIKE @search OR deal_title LIKE @search)");
    }

    if (bank) {
      request.input("bank", bank);
      conditions.push("bank_name = @bank");
    }

    if (category) {
      request.input("category", category);
      conditions.push("category = @category");
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await request.query(
      `SELECT COUNT(*) AS total FROM VW_deal_information ${whereClause}`
    );
    const total = countResult.recordset[0].total;

    request.input("limit", parseInt(limit));
    request.input("offset", offset);

    const result = await request.query(`
      SELECT *
      FROM VW_deal_information
      ${whereClause}
      ORDER BY restaurant_name
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);

    res.json({
      data: result.recordset,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error in GET /deals:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const request = pool.request();
    request.input('email', sql.VarChar, email);
    request.input('password', sql.VarChar, password);

    const result = await request.query(`
      SELECT id, first_name, last_name, email
      FROM users
      WHERE email = @email AND password_hash = @password
    `);

    const user = result.recordset[0];

    if (user) {
      return res.status(200).json({
        message: "User login successful",
        user: {
          id: user.id,
          fullName: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: "customer"
        },
        token: "mock-user-token-456"
      });
    }

    res.status(401).json({ message: "Invalid credentials." });
  } catch (err) {
    res.status(500).json({ error: "Server error during login", details: err.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ message: 'First name, last name, email, and password are required.' });
  }

  try {
    const checkRequest = pool.request();
    checkRequest.input('email', sql.VarChar, email);
    const existingUser = await checkRequest.query('SELECT id FROM users WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const insertRequest = pool.request();
    insertRequest.input('firstname', sql.VarChar, firstname);
    insertRequest.input('lastname', sql.VarChar, lastname);
    insertRequest.input('email', sql.VarChar, email);
    insertRequest.input('password', sql.VarChar, password);

    await insertRequest.query(`
      INSERT INTO users (first_name, last_name, email, password_hash)
      VALUES (@firstname, @lastname, @email, @password)
    `);

    res.status(201).json({ message: "Profile created successfully" });
  } catch (err) {
    res.status(400).json({ error: "Registration failed", details: err.message });
  }
});

app.get("/api/cards", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT id, name, card_network, card_tier, card_type, url_logo 
      FROM cards 
      WHERE is_active = 1
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cards", details: err.message });
  }
});

app.get("/api/wallet/:userId", async (req, res) => {
  try {
    const result = await pool.request()
      .input("userId", sql.Int, req.params.userId)
      .query(`
        SELECT c.id, c.name, c.card_network, c.card_tier, c.card_type, c.url_logo 
        FROM cards c
        JOIN user_cards uc ON c.id = uc.card_id
        WHERE uc.user_id = @userId
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wallet", details: err.message });
  }
});
app.get("/api/deals/my-wallet/:userId", async (req, res) => {
  try {
    const result = await pool.request()
      .input("userId", sql.Int, req.params.userId)
      .query(`
        SELECT 
            d.id,
            d.title,
            d.discount_type,
            d.percentage_value,
            d.flat_value,
            d.end_date,
            r.name AS restaurant_name,
            r.url_logo AS restaurant_logo,
            b.name AS bank_name
        FROM deals d
        JOIN restaurants r ON d.restaurant_id = r.id
        JOIN banks b ON d.bank_id = b.id
        WHERE d.is_active = 1 
        -- This checks if the deal is linked to ANY card the user owns
        AND EXISTS (
            SELECT 1 
            FROM deal_cards dc
            JOIN user_cards uc ON dc.card_id = uc.card_id
            WHERE dc.deal_id = d.id 
            AND uc.user_id = @userId 
            AND uc.removed_at IS NULL
        )
        ORDER BY d.created_at DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch personalized deals", details: err.message });
  }
});

app.post("/api/wallet", async (req, res) => {
  const { userId, cardId } = req.body;
  try {
    const request = pool.request();
    request.input("userId", sql.Int, userId);
    request.input("cardId", sql.Int, cardId);

    await request.query(`
      IF NOT EXISTS (SELECT 1 FROM user_cards WHERE user_id = @userId AND card_id = @cardId)
      BEGIN
        INSERT INTO user_cards (user_id, card_id) VALUES (@userId, @cardId)
      END
    `);

    res.status(200).json({ message: "Card added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add card", details: err.message });
  }
});

app.delete("/api/wallet", async (req, res) => {
  const { userId, cardId } = req.body;
  try {
    const request = pool.request();
    request.input("userId", sql.Int, userId);
    request.input("cardId", sql.Int, cardId);

    await request.query(`
      DELETE FROM user_cards 
      WHERE user_id = @userId AND card_id = @cardId
    `);

    res.status(200).json({ message: "Card removed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove card", details: err.message });
  }
});