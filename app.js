const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBServer();

//converting function
let convert = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

//Dir Conversion
let convertDir = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};

//GET movieName API
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `SELECT movie_name FROM movie;`;
  const movieArray = await db.all(getMovieQuery);
  response.send(movieArray.map((eachMovie) => convert(eachMovie)));
});

//POST movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieInsertQuery = `
        INSERT INTO
            movie (director_id,movie_name,lead_actor)
        VALUES
            (${directorId},
            '${movieName}',
            '${leadActor}');
    `;
  const movie = await db.run(movieInsertQuery);
  response.send("Movie Successfully Added");
});

//GET API on parameters
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
        * 
    FROM 
        movie 
    WHERE
        movie_id=${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convert(movie));
});

//PU API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const putMovieQuery = `
        UPDATE
            movie
        SET  
            director_id = ${directorId},
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE 
            movie_id = ${movieId};
    `;
  await db.run(putMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE  FROM movie WHERE movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET Director API 6
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT * FROM director;`;
  const directorArray = await db.all(getDirectorQuery);
  response.send(directorArray.map((eachItem) => convertDir(eachItem)));
});

//GET director movie API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
    SELECT 
        movie_name 
    FROM 
        movie
    WHERE   
        director_id=${directorId};`;
  const movie = await db.all(getDirectorMovieQuery);
  response.send(movie.map((each) => convert(each)));
});
module.exports = app;
