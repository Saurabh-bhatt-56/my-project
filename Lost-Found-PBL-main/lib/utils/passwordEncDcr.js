import bcrypt from "bcryptjs";

export const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

export const verifyPassword = (pass, userPass) =>{
    return bcrypt.compareSync(pass, userPass);
}