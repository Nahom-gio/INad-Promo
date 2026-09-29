(function($){
  'use strict';

  $('[data-inad-select-gallery]').on('click',function(event){
    event.preventDefault();
    const frame=wp.media({
      title:'Select project gallery images',
      button:{text:'Use selected images'},
      library:{type:'image'},
      multiple:true,
    });
    frame.on('select',function(){
      const attachments=frame.state().get('selection').toJSON();
      $('#inad_gallery_ids').val(attachments.map(item=>item.id).join(','));
      const images=attachments.map(item=>{
        const source=item.sizes?.thumbnail?.url||item.url;
        return $('<img>',{src:source,alt:''});
      });
      $('[data-inad-gallery-preview]').empty().append(images);
    });
    frame.open();
  });

  $('[data-inad-clear-gallery]').on('click',function(event){
    event.preventDefault();
    $('#inad_gallery_ids').val('');
    $('[data-inad-gallery-preview]').empty();
  });

  $('[data-inad-select-video]').on('click',function(event){
    event.preventDefault();
    const frame=wp.media({
      title:'Select About video',
      button:{text:'Use this video'},
      library:{type:'video'},
      multiple:false,
    });
    frame.on('select',function(){
      const attachment=frame.state().get('selection').first().toJSON();
      $('#inad_about_video_id').val(attachment.id);
      $('[data-inad-video-name]').text(attachment.filename||attachment.title);
    });
    frame.open();
  });

  $('[data-inad-clear-video]').on('click',function(event){
    event.preventDefault();
    $('#inad_about_video_id').val('');
    $('[data-inad-video-name]').text('No video selected.');
  });
})(jQuery);

