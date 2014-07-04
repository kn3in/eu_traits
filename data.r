library(countrycode)
load("../EUdiff/model_output.RData")
dummy <- read.csv("data.csv")
mcmcdata <- list(mean_bmi_obs = obs_bmi,
              mean_height_obs = obs_ht,
                 mean_bmi_est = bmi_means,
              mean_height_est = ht_means)
mcmcdata <- lapply(mcmcdata, colMeans)
lapply(mcmcdata, function(x) all.equal(names(x), names(mcmcdata[[1]])))
mcmcdata <- as.data.frame(do.call(cbind, mcmcdata))

cntr <- countrycode(rownames(mcmcdata), origin = "iso2c", destination = "country.name")
.simpleCap <- function(x) {
    s <- strsplit(x, " ")[[1]]
    paste(toupper(substring(s, 1,1)), substring(s, 2),
          sep="", collapse=" ")
}
cntr <- sapply(tolower(cntr), .simpleCap)
names(cntr) <- NULL
mcmcdata$ccode <- cntr

# I think I just won a prize for ugly R code
tmp <- plyr::ldply(c("England", "Scotland", "Wales"), function(name) {
	tmp <- mcmcdata[mcmcdata$ccode == "United Kingdom", ]
    tmp$ccode <- name
    tmp
})

mcmcdata <- as.data.frame(rbind(mcmcdata, tmp))
rownames(mcmcdata) <- NULL
mcmcdata <- mcmcdata[ ,colnames(dummy)]

write.csv(mcmcdata, file = "real_data.csv")