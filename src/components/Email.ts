const sendResetPasswordEmail = (jwtToken: String, userEmail: String, userName: String) => 
{
    userName = userName.replace('.', '**')
    const urlToConfirm = `${ window.location.origin }/users/resetpassword/${ jwtToken }/${ userEmail }/${ userName }`
    //const urlToConfirm = `${ window.location.origin }/users/resetpassword/${ jwtToken }`
    console.log(encodeURI(urlToConfirm))
}

export default sendResetPasswordEmail