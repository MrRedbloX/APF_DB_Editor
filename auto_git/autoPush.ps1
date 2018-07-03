cd ..
pwd
while (1){
    git pull > $void
    git add * > $void
    git commit -m (Get-Date).ToString() > $void
    git push > $void
}
