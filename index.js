const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();

app.use(express.urlencoded({ extended: true }));

app.use('/static', express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());

//DATABSE CONNECTION CODE

const url = 'mongodb://0.0.0.0/Intern';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Product = mongoose.model('Product', productSchema);

mongoose
  .connect(url, {})
  .then((result) => console.log('database connnected'))
  .catch((err) => console.error(err));

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/uploads');
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, file.fieldname + '-' + Date.now());
  },
});
var upload = multer({ storage: storage });

// const upload = multer({ dest: '/uploads' });

//CREATE CODE

app.post('/', upload.single('productImage'), (req, res) => {
  upload.single(req.body.productImage);
  console.log(req.body);
  const { pname, pdes } = req.body;
  // const productImage = req.file;

  const product = new Product({
    title: pname,
    description: pdes,
  });

  product
    .save()
    .then(() => {
      const data = { message: 'Product created successfully!' };
      console.log('Product created successfully');

      res.redirect('/');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

//READ CODE

app.get('/', (req, res) => {
  Product.find()
    .then((products) => {
      res.render('todo.ejs', { todos: products });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

//UPDATE CODE

app.get('/edit/:id', (req, res) => {
  const { id } = req.params;

  Product.findById(id)
    .then((product) => {
      if (!product) {
        res.status(404).send('Todo not found');
      } else {
        res.render('todoEdit.ejs', { product });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

app.post('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { updatedPName, updatedPDes } = req.body;

  Product.findByIdAndUpdate(id, {
    title: updatedPName,
    description: updatedPDes,
  })
    .then(() => {
      console.log('Todo updated successfully');
      res.redirect('/');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

//DELETE CODE

app.get('/remove/:id', (req, res) => {
  const { id } = req.params;

  Product.findByIdAndRemove(id)
    .then(() => {
      console.log('Product deleted successfully');
      res.redirect('/');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

app.listen(3000, () => console.log('Server Up and running'));
