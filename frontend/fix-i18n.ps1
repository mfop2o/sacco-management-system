$f = 'src\pages\DashboardPage.tsx'
$c = Get-Content $f -Raw

# Fix double-prefixed dashboard keys: t('dashboard.xxx') -> td('xxx')
$c = $c -replace "t\('dashboard\.welcome'\)",        "td('welcome')"
$c = $c -replace "t\('dashboard\.subtitle'\)",       "td('subtitle')"
$c = $c -replace "t\('dashboard\.totalMembers'\)",   "td('totalMembers')"
$c = $c -replace "t\('dashboard\.totalSavings'\)",   "td('totalSavings')"
$c = $c -replace "t\('dashboard\.loanPortfolio'\)",  "td('loanPortfolio')"
$c = $c -replace "t\('dashboard\.pendingApprovals'\)","td('pendingApprovals')"
$c = $c -replace "t\('dashboard\.active'\)",         "td('active')"
$c = $c -replace "t\('dashboard\.portfolioBalance'\)","td('portfolioBalance')"
$c = $c -replace "t\('dashboard\.activeLoans'\)",    "td('activeLoans')"
$c = $c -replace "t\('dashboard\.awaitingReview'\)", "td('awaitingReview')"
$c = $c -replace "t\('dashboard\.allClear'\)",       "td('allClear')"
$c = $c -replace "t\('dashboard\.pending'\)",        "td('pending')"
$c = $c -replace "t\('dashboard\.accountBalance'\)", "td('accountBalance')"
$c = $c -replace "t\('dashboard\.savingsVsLoans'\)", "td('savingsVsLoans')"
$c = $c -replace "t\('dashboard\.quickActions'\)",   "td('quickActions')"
$c = $c -replace "t\('dashboard\.portfolioDistribution'\)", "td('portfolioDistribution')"
$c = $c -replace "t\('dashboard\.monthlySavingsVsLoans'\)",  "td('monthlySavingsVsLoans')"
$c = $c -replace "t\('dashboard\.recentActivity'\)", "td('recentActivity')"
$c = $c -replace "t\('dashboard\.transactionBreakdown'\)", "td('transactionBreakdown')"
$c = $c -replace "t\('dashboard\.viewAll'\)",        "td('viewAll')"
$c = $c -replace "t\('dashboard\.activity'\)",       "td('activity')"
$c = $c -replace "t\('dashboard\.activeMembers'\)",  "td('activeMembers')"
$c = $c -replace "t\('dashboard\.loanUtilization'\)","td('loanUtilization')"
$c = $c -replace "t\('dashboard\.total'\)",          "td('total')"
$c = $c -replace "t\('dashboard\.noTransactions'\)", "td('noTransactions')"
$c = $c -replace "t\('dashboard\.browseMembers'\)",  "td('browseMembers')"
$c = $c -replace "t\('dashboard\.submitNewApplication'\)", "td('submitNewApplication')"
$c = $c -replace "t\('dashboard\.pendingLoanRequests'\)", "td('pendingLoanRequests')"
$c = $c -replace "t\('dashboard\.savingsAccounts'\)","td('savingsAccounts')"

# Fix cross-namespace calls: t('members.title') -> tm('title')
$c = $c -replace "t\('members\.title'\)",  "tm('title')"

# Fix cross-namespace sidebar calls: t('nav.xxx') -> ts('xxx')
$c = $c -replace "t\('nav\.loanApplication'\)",  "ts('loanApplication')"
$c = $c -replace "t\('nav\.loanApprovals'\)",    "ts('loanApprovals')"
$c = $c -replace "t\('nav\.savings'\)",          "ts('savings')"

# Fix remaining t('common.loading') etc
$c = $c -replace "t\('common\.loading'\)",  "'Loading...'"
$c = $c -replace "t\('common\.noData'\)",   "td('noTransactions')"
$c = $c -replace "t\('common\.total'\)",    "td('total')"

Set-Content $f $c -NoNewline
Write-Host "Done"
