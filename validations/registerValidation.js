const yup = require('yup');



async function validateRegister(data){
  
    const schema = yup.object().shape({
      name: yup.string().min(3).required(),
      email: yup.string().email().required(),
      password: yup.string().min(8).required()
      });
      
    try{
      await schema.validate(data);
    
      return null;
    } catch (error) {
      return error.errors
      console.log(error.errors);
    }
    
    }
  
    module.exports.validateRegister = validateRegister;