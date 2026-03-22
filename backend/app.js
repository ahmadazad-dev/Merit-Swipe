const express = require("express")
const cors = require("cors")
const sql = require("mssql/msnodesqlv8")
const app = express()

app.use(cors({
   origin: "http://localhost:5173",
   methods:["GET","POST","PUT","DELETE","PATCH"],
   allowedHeaders: ["Authorization","Content-Type"],
   credentials: true
}));

const config = {
   connectionString: "Driver={ODBC Driver 18 for SQL Server}; Server=AHMADLAPTOP123\\SQLEXPRESS;Database=merit_swipe;Trusted_Connection=Yes;Encrypt=Yes;TrustServerCertificate=Yes"
}
let pool;
async function connectDB(){
   try{
      pool = new sql.ConnectionPool(config);
      await pool.connect();
      console.log("connected to databse")
   }catch(e){
      console.log("Error Occured",e);
      process.exit()
   }
}
connectDB();
app.use(express.json())
const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
   console.log(`Listenting at port ${PORT}`)
})

const authenticateToken = (req,res,next)=>{
   console.log("hello")
   next();
}
// <====================================================================================>
//                               Discount Deals APIs
// <====================================================================================>
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