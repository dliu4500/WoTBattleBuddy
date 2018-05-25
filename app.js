var app = angular.module('wotApp', [])

app.controller('wotAppController', function($scope, $http)
{
    $scope.reigon = "com";
    $scope.statusMessage = "No Player Entered"

    $scope.searchPlayer = function ()
    {
        if($scope.playerName == "" || $scope.playerName == undefined)
        {
            document.getElementById("statusMessage").style.display = "";
            document.getElementById("showResults").style.display = "none";
            document.getElementById("warningMessage").style.display = "none";
            return;
        }
        $http.get("https://api.worldoftanks." + $scope.reigon + "/wot/account/list/?language=en&application_id=demo&search=" + $scope.playerName)
        .then(function(response) {
            if(response.data.status != "ok" || response.data.data.length == 0) 
            {
                $scope.statusMessage = "Failed to find player: " + $scope.playerName;
                document.getElementById("statusMessage").style.display = "";
                document.getElementById("showResults").style.display = "none";
                document.getElementById("warningMessage").style.display = "none";
                Console.error("Failed to find player")
                return;
            }
            document.getElementById("warningMessage").style.display = "none";
            if(response.data.data.length > 1)
            {
                document.getElementById("warningMessage").innerHTML = "Warning: Multiple players found, showing results for first player";
                document.getElementById("warningMessage").style.display = "";
                window.console.warn("Multiple matches found for player name, displaying first result")
            }
            
            document.getElementById("statusMessage").style.display = "none";
            document.getElementById("showResults").style.display = "";

            let accountID = response.data.data[0].account_id;
            $scope.playerNameReturned = response.data.data[0].nickname;
            if($scope.reigon == "com") $scope.playerReigon = "North America";
            else if($scope.reigon == "eu") $scope.playerReigon = "Europe";
            else if($scope.reigon == "ru") $scope.playerReigon = "Russia";
            else if($scope.reigon == "asia") $scope.playerReigon = "Asia";
            else $scope.playerReigon = "Unable to find"
            $http.get("https://api.worldoftanks." + $scope.reigon + "/wot/account/info/?application_id=demo&account_id=" + accountID + "&fields=statistics.all")
            .then(function(response){          
                    updateAccountStats(response, accountID);
                    $scope.graphOffensiveStats();
                    $scope.graphDefensiveStats();
                    $scope.graphUtilityStats();
            });
        });

    }

    function updateAccountStats(response, accountID)
    {
        let fields = response.data.data[accountID].statistics.all;
        $scope.battles = fields.battles;
        if($scope.battles == 0)
        {
            document.getElementById("warningMessage").innerHTML = "Warning: Player has no registered games";
            document.getElementById("warningMessage").style.display = "";
        }

        $scope.winPercentage = parseFloat(fields.wins / fields.battles * 100).toFixed(2);
        $scope.lossPercentage = parseFloat(fields.losses / fields.battles * 100).toFixed(2);
        $scope.drawPercentage = parseFloat(fields.draws / fields.battles * 100).toFixed(2);
        $scope.avgExp = parseInt(fields.battle_avg_xp);

        $scope.destroyed = parseFloat(fields.frags / fields.battles).toFixed(2);
        $scope.kdRatio = parseFloat(fields.frags / (fields.battles - fields.survived_battles)).toFixed(2);
        $scope.avgDamage = parseInt(fields.damage_dealt / fields.battles);
        $scope.dmgRatio = parseFloat(fields.damage_dealt / fields.damage_received).toFixed(2);
        $scope.spotted = parseFloat(fields.spotted / fields.battles).toFixed(2);
        $scope.spottingDmg = parseFloat(fields.avg_damage_assisted_radio).toFixed(2);
        $scope.assistanceDmg = parseFloat(fields.avg_damage_assisted_track).toFixed(2);
        $scope.stunAssistance = parseFloat(fields.stun_assisted_damage / fields.battles_on_stunning_vehicles).toFixed(2);
        $scope.capPoints = parseFloat(fields.capture_points / fields.battles).toFixed(2);
        $scope.defPoints = parseFloat(fields.dropped_capture_points / fields.battles).toFixed(2);

        $scope.effectiveFire = parseFloat(fields.piercings / fields.shots).toFixed(2);
        $scope.damageRecieved = parseFloat(fields.damage_received / fields.battles).toFixed(2);
        $scope.damageBlocked = parseFloat(fields.avg_damage_blocked).toFixed(2);
        $scope.survived = parseFloat(fields.survived_battles / fields.battles).toFixed(2);
        $scope.stuns = parseFloat(fields.stun_number / fields.battles).toFixed(2);
    }
    

    Chart.defaults.global.legend.display = false;
    $scope.graphOffensiveStats = function () 
    {
        var expectedTeir = -4.9872+1.22942 * Math.log($scope.battles);
        if(expectedTeir < 1) expectedTeir = 1;
        if(expectedTeir > 8.5) expectedTeir = 8.5;

        var scalingFactor = Math.pow(1.25, expectedTeir - 5)

        var ctx = document.getElementById("offensiveGraph");
        var myChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ["Damage", "Damage Ratio", "Destroyed", "Capture Points", "Effective Fire"],
                datasets: [{
                    data: [($scope.avgDamage / (550 * scalingFactor)) - 1 , $scope.dmgRatio - 1, $scope.destroyed * 1.5 - 1, $scope.capPoints * 2 - 1, $scope.effectiveFire * 2],
                    backgroundColor: "rgba(0, 170, 255, 0.2)",
                    borderColor: "rgba(0, 170, 255, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                scale: {
                        ticks: {
                            suggestedMin: -1,
                            suggestedMax: 1,
                            showLabelBackdrop: false,
                            display: false
                        }
                }
            }
            
        });
    }

    $scope.graphDefensiveStats = function () 
    {
        var expectedTeir = -4.9872+1.22942 * Math.log($scope.battles);
        if(expectedTeir < 1) expectedTeir = 1;
        if(expectedTeir > 8.5) expectedTeir = 8.5;

        var scalingFactor = Math.pow(1.25, expectedTeir - 5)

        var ctx = document.getElementById("defensiveGraph");
        var myChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ["Defence Points", "Damage Recieved", "Damage Blocked Ratio", "Survived"],
                datasets: [{

                    data: [$scope.defPoints * 2 - 1, ($scope.damageRecieved / (300 * scalingFactor)) - 1, $scope.damageBlocked / ((100 * scalingFactor)) - 1, $scope.survived * 5 - 1],
                    backgroundColor: "rgba(0, 170, 255, 0.2)",
                    borderColor: "rgba(0, 170, 255, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                scale: {
                        ticks: {
                            suggestedMin: -1,
                            suggestedMax: 1,
                            showLabelBackdrop: false,
                            display: false
                        }
                }
            }
        });
    }

    $scope.graphUtilityStats = function () 
    {
        var expectedTeir = -4.9872+1.22942 * Math.log($scope.battles);
        if(expectedTeir < 1) expectedTeir = 1;
        if(expectedTeir > 8.5) expectedTeir = 8.5;

        var scalingFactor = Math.pow(1.25, expectedTeir - 5)

        var ctx = document.getElementById("utilityGraph");
        var myChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ["Spotting Damage", "Stun Damage", "Assistance Damage", "Spotted", "Stuns"],
                datasets: [{

                    data: [($scope.spottingDmg / (200 * scalingFactor)) - 1, ($scope.stunAssistance / (300 * scalingFactor)) - 1, ($scope.assistanceDmg / (50 * scalingFactor)) - 1,  $scope.spotted * 0.75 - 1, $scope.stuns],
                    backgroundColor: "rgba(0, 170, 255, 0.2)",
                    borderColor: "rgba(0, 170, 255, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                scale: {
                        ticks: {
                            suggestedMin: -1,
                            suggestedMax: 1,
                            showLabelBackdrop: false,
                            display: false
                        }
                }
            }
        });
    }
});