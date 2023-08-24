const sendResetPasswordEmail = (jwtToken: String, userName: String, userEmail: String) => 
{
    //userEmail = encodeURIComponent((userEmail as string))
    const urlToConfirm = `${ window.location.origin }/users/resetpassword/${ jwtToken }/${ userName }/${ userEmail }`
    //const urlToConfirm = `${ window.location.origin }/users/resetpassword/${ jwtToken }`
    console.log(encodeURI(urlToConfirm))
}

export default sendResetPasswordEmail