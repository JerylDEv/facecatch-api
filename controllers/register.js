const saltRounds = 10;

const handleRegister = (db, bcrypt) => (req, res) => {
  const { email, name, password } = req.body;
  if (password.length < 9 || !email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) {
      console.log(err);
      res.status(400).json('unable to register');
    } else {
      // Store hash in your password DB.
      db.transaction((trx) =>
        trx
          .insert({
            email: email,
            hash: hash,
          })
          .into('login')
          .returning('email')
          .then((loginEmail) =>
            trx('users')
              .returning('*')
              .insert({
                email: loginEmail[0],
                name: name,
                joined: new Date(),
              })
              .then((user) => res.json(user[0]))
          )
          .then(trx.commit)
          .catch(trx.rollback)
      ).catch((err) => {
        console.log(err);
        return res.status(400).json('unable to register');
      });
    }
  });
};

export default {
  handleRegister: handleRegister,
};
