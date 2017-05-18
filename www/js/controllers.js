/**
 * Created by Administrator on 2017/5/8.
 */
angular.module('controllers', [])

    .controller('StartCtrl', ['$scope', '$state',
        function ($scope,$state) {
            $scope.myActiveSlide = 0;
            $scope.enter=function(){
                $state.go("login");
            }


        }])
    .controller('TabsCtrl',['$scope','$rootScope','$http','$ionicTabsDelegate','$ionicSlideBoxDelegate',
        function($scope,$rootScope,$http,$ionicTabsDelegate,$ionicSlideBoxDelegate){

            $rootScope.badges={
                news:0
            };
          $scope.myActiveSlide = 0;
            var getNews=function(){
              //  alert(localStorage.userId);
                $http.get('http://123.56.27.166:8080/barn_application/alarm/getAlarmByUID?UID='+localStorage.userId)
                    .then(function(resp){
                        for(i=0;i<resp.data.length;i++){
                            if(resp.data[i].status=="true"){
                                $rootScope.badges.news++;
                            }
                        }
                    //    alert($scope.badges.news);
                    },function(error){

                    });
            };
            getNews();
            setInterval(function(){
                $rootScope.badges.news=0;
                getNews();
            },1000*60);

         /* $ionicSlideBoxDelegate.loop(true);
          $ionicSlideBoxDelegate.update();
          $scope.slideHasChanged=function(index){

            $ionicTabsDelegate.select(index);
          };
          $scope.onHomeSelected=function(){

            $ionicSlideBoxDelegate.slide(0);
          };
          $scope.onTableSelected=function(){

            $ionicSlideBoxDelegate.slide(1);
          };
          $scope.onRiskSelected=function(){

            $ionicSlideBoxDelegate.slide(2);
          };
          $scope.onPersonalSelected=function(){

            $ionicSlideBoxDelegate.slide(3);
          };
*/
        }])
    .controller('LoginCtrl', ['$scope', '$state','$http','PopupService','LoadingService','$rootScope',
        function ($scope,$state,$http,PopupService,LoadingService,$rootScope) {
            $scope.ctrlScope = $scope;
            if(localStorage.getItem("password")=="" || localStorage.password==null){
                $scope.name = "";
                $scope.password = "";
            }else {
                $scope.name=localStorage.getItem("userId");
                $scope.password=localStorage.getItem("password");
            }
            $scope.login=function(){
                if($scope.name=="" || $scope.password==""){
                   // alert("用户名或密码不能为空");
                    PopupService.setContent("用户名或密码不能为空");
                    PopupService.showAlert();
                    return;
                }else if(isNaN(parseInt($scope.name))){
                   // alert("用户名必须为数字");
                    PopupService.setContent("用户名必须为数字");
                    PopupService.showAlert();
                    return;
                }
               // document.getElementById("loginLoading").style.display="block";
               // document.getElementById("login").style.display="none";
                LoadingService.show();

                $http.get('https://123.56.27.166:8443/barn_application/user/login?UID='+$scope.name+'&password='+$.md5($scope.password))
                    .then(function(resp){
                        if(resp.data.state==1){
                            localStorage.userId=$scope.name;
                            window.plugins.jPushPlugin.setAlias($scope.name);
                            if(document.getElementById("remember").checked==true){
                                localStorage.password=$scope.password;
                            }else{
                                localStorage.password="";
                            }
                            getInfo();
                        }else{
                          //  document.getElementById("loginLoading").style.display="none";
                          //  document.getElementById("login").style.display="block";
                            LoadingService.hide();
                           // alert("用户名或密码错误");
                            PopupService.setContent("用户名或密码错误");
                            PopupService.showAlert();
                        }

                    },function(error){
                        LoadingService.hide();
                        PopupService.setContent("服务器连接失败，请检查您的网络，然后重试");
                        PopupService.showAlert();
                    });

            };

            var getInfo=function(){
                $http.get('http://123.56.27.166:8080/barn_application/user/getUserByUID?UID='+$scope.name)
                    .then(function(resp){
                        localStorage.userName=resp.data.name;
                        localStorage.userAddress=resp.data.address;
                        localStorage.userAge=resp.data.age;
                        localStorage.userSex=resp.data.sex;
                        localStorage.userPhone=resp.data.telephone;
                        getRole();

                    },function(error){

                        LoadingService.hide();
                        PopupService.setContent("服务器连接失败，请检查您的网络，然后下拉刷新重试");
                        PopupService.showAlert();
                    });
            };
            var getRole=function(){
                $http.get('http://123.56.27.166:8080/barn_application/user/getAuthority?UID='+$scope.name)
                    .then(function(resp){
                        LoadingService.hide();
                        localStorage.userRole=resp.data.role_name;
                        $state.go("tabs.home");
                    },function(error){

                        LoadingService.hide();
                        PopupService.setContent("服务器连接失败，请检查您的网络，然后下拉刷新重试");
                        PopupService.showAlert();
                    });
            };


        }])

    .controller('TemperatureCtrl', ['$scope', '$location', '$http','$stateParams',

        function ($scope, $location, $http,$stateParams) {

            $scope.doRefresh = function() {
                $scope.items=[];
                // $scope.enter();
                //获取当前系统时间
                $scope.$broadcast('scroll.refreshComplete');
            };

            $scope.title = $stateParams.title;

            //value作为标志数据，可以进行切换两个图表的标志
            var value = 0;

            //取数据，并且传给echarts图标，其中画图表的部分在drawChart函数中
            $scope.getEchartsData = function () {
                // var url = "http://123.56.27.166:8080/barn_application/barn/getBarnByBNID?BNID=1";
                var url = './js/test2.json';
                $http.get(url).success(function (response) {

                    $scope.datas = response;
                    drawChart(response);
                    console.log('success', response);
                })
            }
            //试验button的切换页面的功能
            $scope.doChangeEcharts = function () {
                if (value == 1) {

                    document.getElementById('second').style.display = "none";
                    document.getElementById('first').style.display = "block";
                    $scope.label = "粮温数据";
                    value = value - 1;
                    console.log('hello，if被调用，此时的value值已经改变，变成了', value);
                }
                else {
                    value = value + 1;
                    document.getElementById('second').style.display = "block";
                    document.getElementById('first').style.display = "none";
                    $scope.label = "异常数据汇总";
                    console.log('hello，else被调用，此时的value值已经改变，变成了', value);
                }
            }
            //drawChart函数功能部分
            function drawChart(chartdata) {


                var statistic25={//所有25度在每一层的个数
                    0:0,
                    1:0,
                    2:0,
                    3:0,
                    4:0

                }
                var statistic30={//每一层级30-35度的个数
                    0:0,
                    1:0,
                    2:0,
                    3:0,
                    4:0

                }
                var statistic35={//所有35度在每一层的个数
                    0:0,
                    1:0,
                    2:0,
                    3:0,
                    4:0

                }
                var allresult={//allresult是图标1的数据，0为5m，1为10m，以此类推
                    0:[],
                    1:[],
                    2:[],
                    3:[],
                    4:[]
                };
                for (var i = 0; i < chartdata.length; i++) {

                    //item数组中的每一项的名称需要修改一下
                    if(chartdata[i].Address>25&&chartdata[i].Address<=30){//25-30度每一层的个数
                        statistic25[chartdata[i].depth]++;
                    }
                    if(chartdata[i].Address>30&&chartdata[i].Address<=35){///30-35度每一层的个数
                        statistic30[chartdata[i].depth]++;
                    }
                    if(chartdata[i].Address>35){
                        statistic35[chartdata[i].depth]++;
                    }
                    allresult[chartdata[i].depth]
                    var item = [chartdata[i].location_x, chartdata[i].location_y, chartdata[i].Address,chartdata[i].depth];
                    allresult[chartdata[i].depth].push(item);


                }

                var chart2datas={   //这个为第二个图标需要的数据，l代表黄颜色，m（medium）代表橙色，h代表红色
                    l:[],//25-30
                    m:[],//30-35
                    h:[]//>35
                }
                for(var i=0;i<5;i++){
                    chart2datas["l"].push(statistic25[i]);
                    chart2datas["m"].push(statistic30[i]);
                    chart2datas["h"].push(statistic35[i]);
                }

                //标签为first的echart的js实现
                // 基于准备好的dom，初始化echarts实例
                var myChart1 = echarts.init(document.getElementById('first'));
                var schema =
                    [
                        { name: 'corE', index: 0, text: '东向位置' },
                        { name: 'corN', index: 1, text: '北向位置' },
                        { name: 'temP', index: 2, text: '摄氏温度' },
                        { name: 'deeP', index: 3, text: '纵向深度' }
                    ];

                var select =
                    [
                        { name: 'P1', index: 0, text: '东：' },
                        { name: 'P2', index: 1, text: '北：' },
                        { name: 'P3', index: 1, text: '温：' }

                    ];

                var itemStyle =
                {
                    normal:
                    {
                        opacity: 100,
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        shadowColor: 'rgba(0, 0, 0, 1)'
                    }
                };
                var option1 = {
                    //固定框架的option写这
                    baseOption: {
                        timeline: {
                            //loop: false,
                            axisType: 'category',
                            autoPlay: false,
                            bottom: 20,
                            label:
                            {
                                normal:
                                {
                                    textStyle:
                                    {
                                        color: '#6B6F72'
                                    }
                                },
                                emphasis: {
                                    textStyle: {
                                        color: '#6B6F72'
                                    }
                                }
                            },
                            symbol: 'none',
                            lineStyle: {
                                color: '#555'
                            },
                            checkpointStyle: {
                                color: '#bbb',
                                borderColor: '#777',
                                borderWidth: 2
                            },
                            controlStyle: {
                                showNextBtn: false,
                                showPrevBtn: false,
                                normal: {
                                    color: '#666',
                                    borderColor: '#666'
                                },
                                emphasis: {
                                    color: '#aaa',
                                    borderColor: '#aaa'
                                }
                            },
                            data: ['5m', '10m', '15m', '20m','25m']
                        },
                        grid: {
                            containLabel: true,
                            top: 10,
                            left: 5
                        },
                        // title: {
                        //     left: 'center',
                        //     textStyle: {
                        //         color: '#6B6F72'
                        //     }
                        // },

                        backgroundColor: '#F3F3F3',

                        color: [
                            '#dd4444', '#fec42c', '#80F1BE'
                        ],
                        //提示框组件，就是浮着的那个
                        tooltip: {
                            padding: 10,
                            backgroundColor: '#222',
                            borderColor: '#777',
                            borderWidth: 1,
                            formatter: function (obj) {
                                var value = obj.value;
                                return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                                    + obj.seriesName
                                    + '</div>'
                                    + schema[0].text + '：' + value[0] + '<br>'
                                    + schema[1].text + '：' + value[1] + '<br>'
                                    + schema[3].text + '：' + value[3] + '<br>'
                                    + schema[2].text + '：' + value[2] + '<br>'
                            }
                        },
                        //区域缩放
                        dataZoom: [
                            {
                                type: 'slider',
                                show: false,
                                yAxisIndex: [0],
                                left: '93%',
                                top: 50,
                                start: 0,
                                end: 100,
                                zoomLock:true,
                                textStyle: {
                                    color: '#aed2ff'},
                                borderColor: '#3c4868',
                                width: '26',
                                height: '70%',
                                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                                handleSize: '90%',
                                labelPrecision: '0',
                                dataBackground: {
                                    areaStyle: {
                                        color: '#222445'
                                    },
                                    lineStyle: {
                                        opacity: 0.8,
                                        color: '#222445'
                                    }
                                },
                                handleStyle: {
                                    color: '#aed2ff',
                                    shadowBlur: 3,
                                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                                    shadowOffsetX: 2,
                                    shadowOffsetY: 2
                                }
                            },//datazoom第一部分

                            {
                                type: 'inside',
                                yAxisIndex: [0],
                                start: 0,
                                end: 100,
                                zoomLock:true,
                                show: true,
                                textStyle: {
                                    color: '#aed2ff'
                                },
                                borderColor: '#3c4868',
                                top: 50,
                                width: '26',
                                height: '70%',
                                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                                handleSize: '90%',
                                dataBackground: {
                                    areaStyle: {
                                        color: '#222445'
                                    },
                                    lineStyle: {
                                        opacity: 0.8,
                                        color: '#222445'
                                    }
                                },
                                handleStyle: {
                                    color: '#aed2ff',
                                    shadowBlur: 3,
                                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                                    shadowOffsetX: 2,
                                    shadowOffsetY: 2
                                }
                            },//datazoom第二部分

                            {
                                "show": false,
                                "height": 23,
                                "xAxisIndex": [
                                    0
                                ],
                                labelPrecision: '0',
                                top: 30,
                                "start": 0,
                                "end": 100,
                                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                                handleSize: '110%',
                                handleStyle: {
                                    color: '#aed2ff',
                                    shadowBlur: 3,
                                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                                    shadowOffsetX: 2,
                                    shadowOffsetY: 2
                                },
                                textStyle: {
                                    color: "#fff"
                                },
                                borderColor: "#90979c"


                            },//datazoom第三部分
                            {
                                "type": "inside",
                                "show": true,
                                "height": 20,
                                "start": 0,
                                "end": 100
                            }//第四部分

                        ],//datazoom结束
                        //底部图例
                        visualMap: {
                            type: "piecewise",
                            min: 0,
                            max: 35,
                            itemWidth: 14,
                            itemHeight: 12,
                            textGap: 3,
                            orient: 'horizontal',
                            inverse: false,
                            right: 0,
                            calculable: true,
                            dimension: 2,
                            inRange: {
                                color: ['#2B6894', '#84CBF0', '#FEEE50', '#F09536', '#E43125']
                            },
                            textStyle: {
                                color: '#6B6F72'
                            }
                        },

                        xAxis: {
                            name: 'X',
                            nameGap: 12,
                            nameTextStyle: {
                                color: '#6B6F72',
                                fontSize: 14
                            },
                            // max: 5,
                            min: 0,
                            splitLine: {
                                show: true
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#6B6F72'
                                }
                            }
                        },

                        yAxis: [{
                            name: 'Y',
                            type: 'value',

                            nameLocation: 'end',
                            nameGap: 12,
                            nameTextStyle: {
                                color: '#6B6F72',
                                fontSize: 16
                            },
                            min: 0,
                            axisLine: {
                                lineStyle: {
                                    color: '#6B6F72'
                                }
                            },
                            splitLine: {
                                show: true
                            }
                        }],

                        series: [
                            {
                                name: '1号粮囤',
                                type: 'scatter',
                                xAxisIndex: 0,
                                yAxisIndex: 0,
                                itemStyle: itemStyle,
                                symbolSize: function (value) {
                                    if (value[2] > 30)
                                    { return Math.round(30); }
                                    else if (value[2] < 20)
                                    { return Math.round(10); }
                                    else { return Math.round(20); }
                                }


                            }
                        ]
                    },

                    //变化数据写这
                    options: [
                        //5m
                        {

                            // title: {
                            //     text: '5m深度处粮温'
                            // },
                            series: [
                                {
                                    data: allresult['0']
                                }



                            ]
                        },
                        //10m
                        {

                            // title: {
                            //     text: '10m深度处粮温'
                            // },
                            series: [
                                {
                                    data: allresult['1']

                                }


                            ]
                        }, //15m
                        {

                            // title: {
                            //     text: '15m深度处粮温'
                            // },
                            series: [
                                {
                                    data:allresult['2']
                                }


                            ]
                        },
                        //20m
                        {
                            // title: {
                            //     text: '20m深度处粮温'

                            // },
                            series: [
                                {
                                    data: allresult['3']
                                }
                            ]
                        }
                    ]
                }
                myChart1.setOption(option1);
                $scope.label = "粮温数据";
                window.onresize = myChart1.resize;


                //标签为second的粮温预警的js实现
                // 基于准备好的dom，初始化echarts实例
                var myChart2 = echarts.init(document.getElementById('second'));
                // 指定图表的配置项和数据
                var option = {
                    // title: {
                    //     text: '异常数据汇总',
                    //     left: 'center',
                    //     top: 30,
                    //     textStyle: {
                    //         color: '#3B746D'
                    //     }
                    // },

                    backgroundColor: '#F3F3F3',
                    label:
                    {
                        normal:
                        {
                            textStyle:
                            {
                                color: '#000000'
                            }
                        },
                        emphasis: {
                            textStyle: {
                                color: '#000000'
                            }
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    color: [
                        '#C6381E', '#FF9900', '#FFCC00', '#33CC00', '#0099FF'
                    ],
                    legend: {

                        bottom: 0,
                        right: 0,
                        textStyle:
                        {
                            color: '#000000',
                            fontWeight: 'lighter'
                        },

                        data: ['>35℃', '[35℃,30℃)', '[30℃,25℃)']
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '10%',
                        top:10,
                        containLabel: true
                    },
                    xAxis: {
                        splitLine: {
                            show: false
                        },
                        //不显示刻度线分割
                        axisTick: {
                            show: false
                        },
                        axisLine: {
                            lineStyle: {
                                color: 'gray'

                            }
                        },
                        type: 'value'
                    },
                    yAxis: {
                        axisLine: {
                            lineStyle: {
                                color: 'gray'
                            }
                        },
                        //不显示刻度线分割
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        }
                        ,
                        type: 'category',
                        data: ['5m', '10m', '15m', '20m','25m']
                    },
                    series: [
                        {
                            name: '>35℃',
                            type: 'bar',
                            stack: '总量',
                            barWidth: 30,
                            label: {
                                normal: {
                                    show: true,
                                    position: 'insideRight'
                                }
                            },
                            data: chart2datas["h"]
                        },
                        {
                            name: '[35℃,30℃)',
                            type: 'bar',
                            stack: '总量',
                            barWidth: 30,
                            label: {
                                normal: {
                                    show: true,
                                    position: 'insideRight'
                                }
                            },
                            data: chart2datas["m"]
                        },
                        {
                            name: '[30℃,25℃)',
                            type: 'bar',
                            stack: '总量',
                            barWidth: 30,
                            label: {
                                normal: {
                                    show: true,
                                    position: 'insideRight'
                                }
                            },
                            data: chart2datas["l"]
                        }
                    ]
                };
                // 使用刚指定的配置项和数据显示图表。
                myChart2.setOption(option);
                window.onresize = myChart2.resize;
            }

        }

    ])
    .controller('HomeCtrl',['$scope','$state','$http','LoadingService','PopupService',
        function($scope,$state,$http,LoadingService,PopupService){
            $scope.loading = true;
            $scope.items = [];
            $scope.size=[];
            $scope.depotType = [];
            $scope.userId=localStorage.userId;
            $scope.long=[];
            $scope.width=[];
            $scope.height=[];
            $scope.borderBottom=[];
            $scope.loadFailedText="";

            LoadingService.show();

            $scope.enter=function(){
                LoadingService.show();
                $http.get('http://123.56.27.166:8080/barn_application/barn/getBNIDByUID?UID='+$scope.userId)
                    .then(function(resp){
                      //  document.getElementById("loading").style.display="none";
                        LoadingService.hide();
                        $scope.loadFailedText="";
                        $scope.items=[];
                        if(resp.data[0].state==1){
                            // 因为后台可能会返回空数据，所以要做一个判断，防止程序崩溃
                        }else {
                            for (i = 0; i < resp.data.length; i++) {
                                var depotName, num, type,description;
                                depotName = resp.data[i].BNID + "号仓";
                                num = resp.data[i].BNID;
                                description = resp.data[i].description;
                                if (resp.data[i].BNType == "circle") {
                                    type = "circle";
                                }
                                if (resp.data[i].BNType == "rectangle") {
                                    type = "square";
                                }
                                if(resp.data.length%2==0){
                                    if(i==resp.data.length-2 || i==resp.data.length-1){
                                        $scope.borderBottom.push("transparent");
                                    }else{
                                        $scope.borderBottom.push("1px solid #bcbcbc");
                                    }
                                }else{
                                    if(i==resp.data.length-1){
                                        $scope.borderBottom.push("transparent");
                                    }else{
                                        $scope.borderBottom.push("1px solid #bcbcbc");
                                    }
                                }

                                $scope.items.push({depotName: depotName, num: num, type: type,description:description});
                                if (type == "circle") {
                                    $scope.depotType.push("img/icon-circle-depot.png");
                                }
                                if (type == "square") {
                                    $scope.depotType.push("img/icon-square-depot.png");
                                }
                                $scope.size[i] = resp.data[i].size.split("/");
                                $scope.long[i] = $scope.size[i][0];
                                $scope.width[i] = $scope.size[i][1];
                                $scope.height[i] = $scope.size[i][2];
                            }

                        }

                    },function(error){
                        LoadingService.hide();
                        PopupService.setContent("服务器连接失败，请检查您的网络，然后下拉刷新重试");
                        PopupService.showAlert();
                        if($scope.items.length==0){
                            $scope.loadFailedText="数据加载失败";
                        }

                    });
            };

            $scope.enter();


            $scope.click = function(num,description,i){

                $state.go('tabs.detail',
                    {number:num,long:$scope.long[i],width:$scope.width[i],height:$scope.height[i],description:description});
            };

            $scope.doRefresh = function() {
                    $scope.enter();
                $scope.$broadcast('scroll.refreshComplete');
            };

        }])
    .controller('DetailCtrl',['$scope','$state','$stateParams','$window','$timeout','$http','PopupService','LoadingService',
        function($scope,$state,$stateParams,$window,$timeout,$http,PopupService,LoadingService){

            var number = $stateParams.number;
            var userId=localStorage.getItem("userId");
            $scope.table={};
            $scope.phonenum=localStorage.getItem("userPhone");
            $scope.table.description=$stateParams.description;
            $scope.long = $stateParams.long;
            $scope.width = $stateParams.width;
            $scope.height = $stateParams.height;
            $scope.table.title = number+ "号仓";
            $scope.noMore = false;
            $scope.loadText = "继续拖动，查看小仓库";
            $scope.items = [];
            $scope.userRole=localStorage.getItem("userRole");
            $scope.userName=localStorage.getItem("userName");
            $scope.display="none";
            $scope.loadFailedText="";
            LoadingService.show();

            $scope.enter=function(){
                LoadingService.show();
                $http.get('http://123.56.27.166:8080/barn_application/barn/getBarnByBNID?BNID='+number)
                    .then(function(resp){
                        $scope.items = [];
                        LoadingService.hide();
                        $scope.loadText = "继续拖动，查看小仓库";
                        $scope.noMore = false;
                        $scope.display="block";
                        $scope.loadFailedText="";
                        var leftBigText,rightGrayText,barnId;
                        for(i=0;i<resp.data.length;i++){

                            if(i==0)leftBigText="小仓一";
                            if(i==1)leftBigText="小仓二";
                            if(i==2)leftBigText="小仓三";
                            if(i==3)leftBigText="小仓四";
                            if(i==3)leftBigText="小仓五";

                            rightGrayText="最大库存"+resp.data[i].volumn+"t";
                            barnId = resp.data[i].barn_cell_id;
                            $scope.items.push( {leftBigText:leftBigText,leftSmallText:'（种类/稻谷）',rightGrayText:rightGrayText,rightBlackText:'当前库存700t',barnId:barnId})
                        }
                    },function(error){
                        LoadingService.hide();
                        PopupService.setContent("服务器连接失败，请检查您的网络，然后下拉刷新重试");
                        PopupService.showAlert();
                        $scope.display="none";
                        if($scope.items.length==0){
                            $scope.loadFailedText="数据加载失败";
                        }
                    });
            };

            $scope.enter();

            $scope.back=function(){
                $state.go("tabs.home");
            };
            $scope.callPhone=function(phonenumber){
                $window.location.href="tel:"+phonenumber;
            };
            $scope.doRefresh = function() {
                $scope.enter();
                $scope.$broadcast('scroll.refreshComplete');
            };
            $scope.loadMore = function() {
                $timeout(function () {
                    $scope.noMore = true;
                    $scope.loadText = "已没有更多数据";
                }, 1000);
                $scope.$broadcast('scroll.infiniteScrollComplete');

            };

            $scope.viewTemperature = function(text,id){
                $state.go('tabs.temperature',
                    {title:text,id:id});
            }


        }])
    .controller('RiskCtrl',['$scope',
        function($scope){
            $scope.itemClass=["item","item","item"];
            $scope.warn="img/risk-icon-warn.png";
            $scope.violation="img/risk-icon-violation.png";
            $scope.statistic="img/risk-icon-statistic.png";
            $scope.arrow="img/icon-grey-arrow-right.png";
            $scope.onTouch=function(n){
                if(n==0){
                    $scope.warn="img/risk-icon-warn-light.png";
                }
                if(n==1){
                    $scope.violation="img/risk-icon-violation-light.png";
                }
                if(n==2){
                    $scope.statistic="img/risk-icon-statistic-light.png";
                }

                for(var i=0;i<3;i++){
                    if(i==n){
                        $scope.itemClass[i] = "item green-yellow-bg";
                    }else{
                        $scope.itemClass[i] = "item";
                    }
                }

                $scope.arrow="img/icon-white-arrow-right.png";
            };
            $scope.onRelease=function(n){
                if(n==0){
                    $scope.warn="img/risk-icon-warn.png";
                }
                if(n==1){
                    $scope.violation="img/risk-icon-violation.png";
                }
                if(n==2){
                    $scope.statistic="img/risk-icon-statistic.png";
                }

                for(var i=0;i<3;i++){
                    $scope.itemClass[i] = "item";
                }

                $scope.arrow="img/icon-grey-arrow-right.png";
            };
        }])
    .controller('WarnCtrl',['$scope','$state','$http','LoadingService','PopupService',
        function($scope,$state,$http,LoadingService,PopupService){

            var userId=localStorage.getItem("userId");
            $scope.items=[];
            $scope.itemClass1=[];
            $scope.itemClass2=[];
            $scope.loadFailedText="";
            LoadingService.show();
            $scope.enter=function(){
                LoadingService.show();
                $http.get('http://123.56.27.166:8080/barn_application/alarm/getAlarmByUID?UID='+userId,{cache:false})
                    .then(function(resp){
                        //  document.getElementById("warnLoading").style.display="none";
                        //  document.getElementById("warn").style.display="block";
                        LoadingService.hide();
                        $scope.loadFailedText="";
                        $scope.items=[];
                        var title,detail,date,time,flag,duration,alarmId;
                        for(i=0;i<resp.data.length;i++){

                            title=resp.data[i].BNID+"号仓报警";
                            detail=resp.data[i].BNID+"号"+resp.data[i].alarm_name;
                            date=resp.data[i].time.split(" ")[0];
                            alarmId=resp.data[i].id;
                            if(resp.data[i].time.split(" ")[1].split(":")[0]>12){
                                duration="pm";
                            }else{
                                duration="am";
                            }
                            time=resp.data[i].time.split(" ")[1].split(".")[0]+" "+duration;
                            if(resp.data[i].status=="true"){
                                flag=0;
                            }else{
                                flag=1;
                            }
                            $scope.items.push({date:date, time:time,title:title,detail:detail,flag:flag,alarmId:alarmId});

                        }
                        $scope.items.sort(function(a,b){
                            return a.flag-b.flag});
                        for(i=0;i<$scope.items.length;i++){
                            if ($scope.items[i].flag == 0) {
                                $scope.itemClass1.push("");
                                $scope.itemClass2.push("item warn-right-item");
                            } else {
                                $scope.itemClass1.push("lightgray-bg");
                                $scope.itemClass2.push("item warn-right-item lightgray-bg");
                            }
                        }

                    },function(error){
                        LoadingService.hide();
                        PopupService.setContent("服务器连接失败，请检查您的网络，然后下拉刷新页面");
                        PopupService.showAlert();
                        if($scope.items.length==0){
                            $scope.loadFailedText="数据加载失败";
                        }

                    });
            };

            $scope.enter();

            $scope.goConfirm=function(detail,flag,id){
                /*console.log(id);*/
                localStorage.alarmDetail=detail;
                localStorage.alarmFlag=flag;
                localStorage.alarmId=id;
                localStorage.receiveType=0;
                $state.go("tabs.confirmwarn",{detail:detail,flag:flag,alarmId:id,type:0});
            };

            $scope.doRefresh = function() {
                $scope.enter();
                $scope.$broadcast('scroll.refreshComplete');
            };

        }])
    .controller('WarnConfirmCtrl',['$scope','$stateParams','$http','$ionicHistory','$state','PopupService','$rootScope',
        function($scope,$stateParams,$http,$ionicHistory,$state,PopupService,$rootScope){

            if($ionicHistory.backView().stateName!="tabs.warn"){
                $scope.hide=true;
                $scope.display="block";
                //   document.getElementById("confirmTitle").style.display="block";
             //   $ionicHistory.backView().stateName="tabs.risk"
            }else{
                $scope.hide=false;
                $scope.display="none";
            }

            $scope.buttonText = "领取预警";
            $scope.buttonClass = "green-bg";
          /*  var type=$stateParams.type;
            $scope.detail = $stateParams.detail;
            $scope.flag = $stateParams.flag;
            $scope.alarmId = $stateParams.alarmId;*/

            /*alert($ionicHistory.currentView().stateName);
            var keys="";
            for(key in $ionicHistory.backView()){
                keys=keys+"--"+key;
            }
            alert(keys);
            alert($ionicHistory.backView().stateName);*/
            var type=localStorage.receiveType;
            $scope.detail = localStorage.alarmDetail;
            $scope.flag = localStorage.alarmFlag;
            $scope.alarmId = localStorage.alarmId;
            if($scope.flag==1){
                $scope.buttonText = "已领取";
                $scope.buttonClass = "lightgray-bg";
                document.getElementById("confirm").disabled="disabled";
            }
            $scope.confirm=function(){
                if(type==0){
                    $http.get('http://123.56.27.166:8080/barn_application/alarm/modifyStatusByAlarmId?' +
                        'alarm_id='+$scope.alarmId+'&confirm_UID='+localStorage.userId)
                        .then(function(resp){
                            //   alert(resp);
                            if(resp.data.state==1){
                                // alert("确认成功");
                                PopupService.setContent("确认成功");
                                PopupService.showAlert();
                                $scope.buttonText = "已领取";
                                $scope.buttonClass = "lightgray-bg";
                                $rootScope.badges.news=$rootScope.badges.news-1;
                            }else{
                                // alert("领取失败");
                                PopupService.setContent("领取失败");
                                PopupService.showAlert();
                            }
                        },function(error){
                            PopupService.setContent("服务器连接失败，请检查您的网络，然后重试");
                            PopupService.showAlert();
                        });
                }else{
                    var deviceId=localStorage.warnDeviceId;
                    var address=localStorage.warnAddress;
                    var alarmType=localStorage.warnAlarmType;
                    var unixTimestamp,newtime;
                    if(localStorage.warnTime.split('-').length!=1){
                        newtime=localStorage.warnTime;
                    }else{
                        var time=parseInt(localStorage.warnTime);
                        unixTimestamp = new Date(time*1000) ;
                        newtime = unixTimestamp.getFullYear()+'-'+(unixTimestamp.getMonth()+1)+'-'+unixTimestamp.getDate()
                            +' '+unixTimestamp.getHours()+':'+unixTimestamp.getMinutes()+':'+unixTimestamp.getSeconds();
                    }
                    $http.get('http://123.56.27.166:8080/barn_application/alarm/modifyStatusByParas?' +
                        'device_id='+deviceId+'&address='+address+'&time='+newtime+'&alarm_type_id='+alarmType+'&confirm_UID='+localStorage.userId)
                        .then(function(resp){

                            if(resp.data.state==1){
                                // alert("确认成功");
                                PopupService.setContent("确认成功");
                                PopupService.showAlert();
                                $scope.buttonText = "已领取";
                                $scope.buttonClass = "lightgray-bg";
                                $rootScope.badges.news=$rootScope.badges.news-1;
                            }else{
                                // alert("领取失败");
                                PopupService.setContent("领取失败");
                                PopupService.showAlert();
                            }

                        },function(error){

                            PopupService.setContent("服务器连接失败，请检查您的网络，然后重试");
                            PopupService.showAlert();
                        });
                }


            };
            $scope.back=function(){
                $state.go("tabs.risk");
              //  $ionicHistory.goBack();
            }

        }])
    .controller('PersonCtrl',['$scope','$state','$ionicHistory',
        function($scope,$state,$ionicHistory){
            $scope.version="当前"+localStorage.appVersion;
            $scope.userName=localStorage.userName;
            $scope.logout=function(){
                $ionicHistory.clearCache();
                $ionicHistory.clearHistory();
                $state.go("login");
            };
        }])
    .controller('PersonInfoCtrl',['$scope','$state','LoginService',
        function($scope){
            $scope.person={};
            $scope.person.role=localStorage.userRole;
            $scope.person.name=localStorage.userName;
            $scope.person.sex=localStorage.userSex;
            $scope.person.age=localStorage.userAge;
            $scope.person.address=localStorage.userAddress;
        }])

    .controller('StatisticCtrl',['$scope','$state','$http',function ($scope,$state,$http) {

        //获取数据
        $scope.doMessage = function () {


            var url = "http://123.56.27.166:8080/barn_application/alarm/getAlarmInfoByBNID?BNID=1";
            // var url = './templates/police.json';
            $http.get(url).success(function (response) {

                $scope.datas = response;

                var alreadyLength = 0;
                for(i=0;i<response.length;i++){
                    if(response[i].status == "true")
                        alreadyLength++;
                }
                var length1 = Math.round(alreadyLength/response.length*10000)/100.00;
                var length2 = 100-length1;
                $scope.message = {already:length1+'%',notyet:length2+'%'};
                console.log('success!!!!!!', response);
            })
            $scope.myvalue = 0.8;
        }
        //获取Canvas对象(画布)
        var canvas = document.getElementById("myCanvas");
        //简单地检测当前浏览器是否支持Canvas对象，以免在一些不支持html5的浏览器中提示语法错误
        if (canvas.getContext) {
            //获取对应的CanvasRenderingContext2D对象(画笔)
            var context = canvas.getContext("2d");
            var value = canvas.getAttribute("value");
            var centerSize = [60, 60, 50];
            //灰色的
            context.beginPath();
            context.moveTo(centerSize[0], centerSize[1]);
            context.arc(centerSize[0], centerSize[1], centerSize[2], 0, Math.PI * 2, false);
            context.closePath();
            context.fillStyle = '#E93458';
            context.fill();
            //画红色的圆
            context.beginPath();
            context.moveTo(centerSize[0], centerSize[1]);
            context.arc(centerSize[0], centerSize[1], centerSize[2], 0, Math.PI * 2 * value, false);
            context.closePath();
            context.fillStyle = '#F099B8';
            context.fill();
            //画里面的白色的圆
            context.beginPath();
            context.moveTo(centerSize[0], centerSize[1]);
            context.arc(centerSize[0], centerSize[1], centerSize[2] - 15, 0, Math.PI * 2, true);
            context.closePath();
            context.fillStyle = 'rgba(255,255,255,1)';
            context.fill();
        }

        //获取Canvas对象(画布)
        var canvas2 = document.getElementById("myCanvas2");
        //简单地检测当前浏览器是否支持Canvas对象，以免在一些不支持html5的浏览器中提示语法错误
        if (canvas2.getContext) {
            //获取对应的CanvasRenderingContext2D对象(画笔)
            var context = canvas2.getContext("2d");
            var value = canvas2.getAttribute("value");
            var centerSize = [60, 60, 50];
            //灰色的
            context.beginPath();
            context.moveTo(centerSize[0], centerSize[1]);
            context.arc(centerSize[0], centerSize[1], centerSize[2], 0, Math.PI * 2, false);
            context.closePath();
            context.fillStyle = '#4DAED5';
            context.fill();
            //画红色的圆
            context.beginPath();
            context.moveTo(centerSize[0], centerSize[1]);
            context.arc(centerSize[0], centerSize[1], centerSize[2], 0, Math.PI * 2 * value, false);
            context.closePath();
            context.fillStyle = '#99E2FC';
            context.fill();
            //画里面的白色的圆
            context.beginPath();
            context.moveTo(centerSize[0], centerSize[1]);
            context.arc(centerSize[0], centerSize[1], centerSize[2] - 15, 0, Math.PI * 2, true);
            context.closePath();
            context.fillStyle = 'rgba(255,255,255,1)';
            context.fill();
        }
    }])
