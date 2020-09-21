//GLOBAL VARIABLES
let searchForChannel;
let playListId;


$(function () {
    //key
    const API_KEY = 'AIzaSyDbQowDf3wo5fsSXQlu2eRKskZ_er6RiIA'

   
    let videos = $('#videos')

    //EVENT HANDLER
    $('form').on('submit', handleFormSubmit)
    $('#channelInfo').on('click', getVids)
    $('#clearAll').on('click',clearAll)

    // addChannel()


    //get user input from form and pass it as an argument to the getChannel function which makes the a request to the API
    function handleFormSubmit(e) {
        e.preventDefault()
        searchForChannel = $('input').val()
        $('input').val('')

        getChannel(searchForChannel)
    }


    //API REQUESTS

    //get channel info from API
    function getChannel(searchForChannel) {
        $.get(`https://www.googleapis.com/youtube/v3/channels/?part=snippet%2CcontentDetails%2Cstatistics&forUsername=${searchForChannel}&maxResults=10&key=${API_KEY}`, function (response) {
            if (response.pageInfo.totalResults === 0) alert('No Youtube channel by that name!')
            render(response)
            addChannel(response.items[0])
        })
    }

    function render(response) {
        $.each(response.items, function (i, item) {
            let output = `
       <ul class='list-group'>
         <li class='list-group-item li-top'><b>Title</b>: ${item.snippet.title}</li>
         <li class='list-group-item'><b>Subscribers</b>: ${numberWithCommas(item.statistics.subscriberCount)}</li>
         <li class='list-group-item'><b>Views</b>: ${numberWithCommas(item.statistics.viewCount)}</li>
         <li class='list-group-item li-bottom'><b>Videos</b>: ${numberWithCommas(item.statistics.videoCount)}</li>
         <button id='displayVideos'  class='btn btn-danger'>View videos</button>
       </ul>
     `
            $('#channelInfo').append(output)
           

        })
        
    }


    //get videos in  channel playlist from API
    function getVids(e) {
        let title
        let channels = getChannels()
        if ($(e.target).text() === 'View videos'){
             videos.html('')
             title = getTitle($(e.target).closest('ul').children('.li-top').text())
             $('.view').text(`Latest videos for ${title}`)
             channels.forEach(val => {
                 if(title === val.snippet.title){
                     playListId = val.contentDetails.relatedPlaylists.uploads
                 }
             })
             
             $.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=15&playlistId=${playListId}&key=${API_KEY}`,
                 function (data) {
                     $.each(data.items, function (i, item) {
                         let videoId = item.snippet.resourceId.videoId
     
                         let output = `<div id='vidDisplay' style='display:inherit'> <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
     
                         $('#videos').append(output)
                     })
                 }
             )
        }
    }



    //HELPERS
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    //set local storage
    function getChannels() {
        let channels
        if (localStorage.getItem('channels') === null) {
            channels = [];
        } else {
            channels = JSON.parse(localStorage.getItem('channels'));
        }
        return channels;
    }

    function addChannel(channel){
        const channels = getChannels()
        channels.push(channel);
        localStorage.setItem('channels', JSON.stringify(channels));
    }


    let renderFroMStorage = (function(){
        console.log(getChannels())
        let channels = getChannels()
        $.each(channels, function (i, item) {
            playListId = item.contentDetails.relatedPlaylists.uploads

            let output = `
       <ul class='list-group'>
         <li class='list-group-item li-top'><b>Title</b>: ${item.snippet.title}</li>
         <li class='list-group-item'><b>Subscribers</b>: ${numberWithCommas(item.statistics.subscriberCount)}</li>
         <li class='list-group-item'><b>Views</b>: ${numberWithCommas(item.statistics.viewCount)}</li>
         <li class='list-group-item li-bottom'><b>Videos</b>: ${numberWithCommas(item.statistics.videoCount)}</li>
         <button id='displayVideos'  class='btn btn-danger'>View videos</button>
       </ul>
     `
            $('#channelInfo').append(output)
            $('#displayVideos').on('click', getVids)

        })
    })() 

    function getTitle(string){
        let newString = ''
        let splitted = [...string]
        splitted.splice(0,7)
        splitted.forEach(val => {
            if(typeof(val) === 'string'){
                newString += val
            }
        })
        return newString
    }

    function clearAll(){
        $('#channelInfo').html('')
        videos.html('')
        $('.view').text('View Videos:')
        localStorage.clear()
    }


})






