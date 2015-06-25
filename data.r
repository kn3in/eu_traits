library(countrycode)
load("../EUdiff/model_output.RData")
dummy <- read.csv("data.csv")
mcmcdata <- list(mean_bmi_obs = obs_bmi,
              mean_height_obs = obs_ht,
                 mean_bmi_est = bmi_means,
              mean_height_est = ht_means)
#---------------------------------------------------------------
new_height <- read.table("map_height.txt")
new_bmi <- read.table("map_bmi.txt")

new_means_height <- plyr::ddply(new_height, "V2", function(x) {
	mean(x$V1)
})

new_means_bmi <- plyr::ddply(new_bmi, "V2", function(x) {
	mean(x$V1)
})

colnames(new_means_height)[2] <- "mean_height_est"
new_means_height$ccode <- countrycode(new_means_height$V2, origin = "iso3c", destination = "country.name")

colnames(new_means_bmi)[2] <- "mean_bmi_est"
new_means_bmi$ccode <- countrycode(new_means_bmi$V2, origin = "iso3c", destination = "country.name")

new_dt <- merge(new_means_bmi[ ,-1], new_means_height[ ,-1], by = "ccode")

tmpnew <- plyr::ldply(c("England", "Scotland", "Wales"), function(name) {
	tmp <- new_dt[new_dt$ccode == "United Kingdom", ]
    tmp$ccode <- name
    tmp
})

new_dt <- as.data.frame(rbind(new_dt, tmpnew))
#---------------------------------------------------------------

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
#---------------------------------------------------------------
mcmcdata
new_dt
mcmcdata <- merge(mcmcdata[ ,-c(4,5)], new_dt, by = "ccode")
mcmcdata <- mcmcdata[ ,colnames(dummy)]
write.csv(mcmcdata, file = "real_data.csv")































