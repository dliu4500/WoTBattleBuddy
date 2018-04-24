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
            });
        });
        $scope.graphOffensiveStats();
        $scope.graphDefensiveStats();
        $scope.graphUtilityStats();
    }

    function updateAccountStats(response, accountID)
    {
        let fields = response.data.data[accountID].statistics.all;
        $scope.battles = fields.battles;
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
    }

    Chart.defaults.global.legend.display = false;
    $scope.graphOffensiveStats = function () 
    {
        var ctx = document.getElementById("offensiveGraph");
        var myChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ["Damage", "Damage Ratio", "Destroyed", "Capture Points", "Effective Fire"],
                datasets: [{
                    data: [0.5, 0.75, -0.13, 0.2, 0],
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
        var ctx = document.getElementById("defensiveGraph");
        var myChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ["Defence Points", "Damage Recieved", "Damage Blocked Ratio", "Survived"],
                datasets: [{

                    data: [0.1, 0.9, -0.4, -1],
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
        var ctx = document.getElementById("utilityGraph");
        var myChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ["Spotting Damage", "Stun Damage", "Assistance Damage", "Spotted", "Stuns"],
                datasets: [{

                    data: [0.1, 0.76, 0, -0.97, 1, -0.45],
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