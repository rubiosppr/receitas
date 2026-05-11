const { Aluno } = require('../models');

(async () => {
  try {
    const admin = await Aluno.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123'
    });

    console.log('Admin created successfully:', admin.toJSON());
    process.exit(0);
  } catch (error) {
    console.error('Unable to create admin:', error);
    process.exit(1);
  }
})();
