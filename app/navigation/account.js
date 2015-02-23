(function() {
  var _footer, _userImage, _userEmail, fxaButton;

  document.addEventListener('DOMContentLoaded', () => {
    _footer = document.getElementById('footer');
    _userImage = document.getElementById('user-image');
    _userEmail = document.getElementById('user-email');
    _fxaButton = document.getElementById('fxa');

    _fxaButton.addEventListener('click', () => {
      ProfileStorage.get().then((account) => {
        account ? Accounts.signOut() : Accounts.signIn();
      });
    });

    ProfileStorage.get().then((profile) => {
      if (profile) {
        showAccountInfo(profile);
      }
    });
    Accounts.addEventListener('login', showAccountInfo);
    Accounts.addEventListener('logout', hideAccountInfo);
  });

  function showAccountInfo(profile) {
    _userEmail.textContent = profile.email;
    if (profile.avatar) {
      _userImage.src = profile.avatar;
    }
    _footer.classList.remove('hide');
    _fxaButton.textContent = 'Logout';
  }

  function hideAccountInfo() {
    _footer.classList.add('hide');
    _userImage.src = 'navigation/images/default-no-profile-pic.png';
    _userEmail.textContent = 'user@domain.org';
    _fxaButton.textContent = 'Login';
  }
})();
