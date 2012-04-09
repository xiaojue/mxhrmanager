/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20120408
 * @fileoverview loader ie8 -
 */

package{
  import flash.display.Sprite;
  import flash.display.Bitmap;
  import flash.display.BitmapData;
  import flash.display.Loader;
  import flash.net.URLRequest;
  import flash.net.URLStream;
  import flash.utils.ByteArray;
  import flash.system.LoaderContext;
  import flash.external.ExternalInterface;
  import flash.events.Event;
  import flash.events.ProgressEvent;
  import mx.graphics.codec.PNGEncoder;
  import mx.utils.Base64Encoder;
  import flash.utils.ByteArray;

  public class mxhrmanager extends Sprite{
    private var stream:URLStream;
    private var data:ByteArray;
    public function mxhrmanager():void{
      if(ExternalInterface.available){        
        ExternalInterface.addCallback('load',getmxhr);    
      }
    }
     private function getmxhr(value:String):void{
       data = new ByteArray;
       stream = new URLStream;
       stream.load(new URLRequest(value));
       stream.addEventListener(Event.COMPLETE,loadComplete);
       stream.addEventListener(ProgressEvent.PROGRESS,loadProgress);
    }
    private function loadComplete(event:Event):void{
       stream.removeEventListener(Event.COMPLETE,loadComplete);
       stream.removeEventListener(ProgressEvent.PROGRESS,loadProgress);
       update();
       if(isLoad) stream.close();
       dispatchEvent(event);
       ExternalInterface.call('mxhrmanager.complete','complete');
    }
    private function loadProgress(event:ProgressEvent):void{
       if(stream.bytesAvailable == 0) return; 
       update();
       dispatchEvent(event);
    }
    private function update():void{
      if(isLoad){
       stream.readBytes(data,data.length);
       ExternalInterface.call('mxhrmanager.getPacket',data.toString());
      }
    }
    private function close():void{
      if(isLoad) stream.close();
      stream = null;
      data = null;
    }
    private function get isLoad():Boolean{
      if(stream == null) return false;
      return stream.connected;
    }
  }
}
