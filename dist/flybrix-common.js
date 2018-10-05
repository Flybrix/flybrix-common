(function() {
    'use strict';

    angular.module('flybrixCommon', []);
}());

(function () {
    'use strict';
    descriptorsHandler.$inject = [];
    angular.module('flybrixCommon').factory('descriptorsHandler', descriptorsHandler);
    function descriptorsHandler() {
        var versions = {"1.4.0":"1.4.txt","1.5.0":"1.5.txt","1.5.1":"1.5.txt","1.6.0":"1.6.txt","1.7.0":"1.7.txt"};
        var files = {"1.4.txt":"Vector3f={x:f32,y:f32,z:f32};PIDSettings={kp:f32,ki:f32,kd:f32,integral_windup_guard:f32,d_filter_time:f32,setpoint_filter_time:f32,command_to_value:f32};Version={major:u8,minor:u8,patch:u8};ConfigID=u32;PcbTransform={orientation:Vector3f,translation:Vector3f};MixTable={fz:[i8:8],tx:[i8:8],ty:[i8:8],tz:[i8:8]};MagBias={offset:Vector3f};ChannelProperties={assignment:{thrust:u8,pitch:u8,roll:u8,yaw:u8,aux1:u8,aux2:u8},inversion:{/8/thrust:void,pitch:void,roll:void,yaw:void,aux1:void,aux2:void},midpoint:[u16:6],deadzone:[u16:6]};PIDBypass={/8/thrust_master:void,pitch_master:void,roll_master:void,yaw_master:void,thrust_slave:void,pitch_slave:void,roll_slave:void,yaw_slave:void};PIDParameters={thrust_master:PIDSettings,pitch_master:PIDSettings,roll_master:PIDSettings,yaw_master:PIDSettings,thrust_slave:PIDSettings,pitch_slave:PIDSettings,roll_slave:PIDSettings,yaw_slave:PIDSettings,pid_bypass:PIDBypass};StateParameters={state_estimation:[f32:2],enable:[f32:2]};StatusFlag={/16/boot:void,mpu_fail:void,bmp_fail:void,rx_fail:void,idle:void,enabling:void,clear_mpu_bias:void,set_mpu_bias:void,fail_stability:void,fail_angle:void,enabled:void,battery_low:void,temp_warning:void,log_full:void,fail_other:void,override:void};Color={red:u8,green:u8,blue:u8};LEDStateColors={right_front:Color,right_back:Color,left_front:Color,left_back:Color};LEDStateCase={status:StatusFlag,pattern:u8,colors:LEDStateColors,indicator_red:bool,indicator_green:bool};LEDStates=[/16/LEDStateCase:16];LEDStatesFixed=[LEDStateCase:16];DeviceName=s9;Configuration={/16/version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStates,name:DeviceName};ConfigurationFixed={version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStatesFixed,name:DeviceName};ConfigurationFlag={/16/version:void,id:void,pcb_transform:void,mix_table:void,mag_bias:void,channel:void,pid_parameters:void,state_parameters:void,led_states:[//void:16],name:void};Rotation={pitch:f32,roll:f32,yaw:f32};PIDState={timestamp_us:u32,input:f32,setpoint:f32,p_term:f32,i_term:f32,d_term:f32};RcCommand={throttle:i16,pitch:i16,roll:i16,yaw:i16};State={/32/timestamp_us:u32,status:StatusFlag,v0_raw:u16,i0_raw:u16,i1_raw:u16,accel:Vector3f,gyro:Vector3f,mag:Vector3f,temperature:u16,pressure:u32,ppm:[i16:6],aux_chan_mask:u8,command:RcCommand,control:{fz:f32,tx:f32,ty:f32,tz:f32},pid_master_fz:PIDState,pid_master_tx:PIDState,pid_master_ty:PIDState,pid_master_tz:PIDState,pid_slave_fz:PIDState,pid_slave_tx:PIDState,pid_slave_ty:PIDState,pid_slave_tz:PIDState,motor_out:[i16:8],kinematics_angle:Rotation,kinematics_rate:Rotation,kinematics_altitude:f32,loop_count:u32};StateFields={/32/timestamp_us:void,status:void,v0_raw:void,i0_raw:void,i1_raw:void,accel:void,gyro:void,mag:void,temperature:void,pressure:void,ppm:void,aux_chan_mask:void,command:void,control:void,pid_master_fz:void,pid_master_tx:void,pid_master_ty:void,pid_master_tz:void,pid_slave_fz:void,pid_slave_tx:void,pid_slave_ty:void,pid_slave_tz:void,motor_out:void,kinematics_angle:void,kinematics_rate:void,kinematics_altitude:void,loop_count:void};AuxMask={//aux1_low:void,aux1_mid:void,aux1_high:void,aux2_low:void,aux2_mid:void,aux2_high:void};Command={/32/request_response:void,set_eeprom_data:ConfigurationFixed,reinit_eeprom_data:void,request_eeprom_data:void,request_enable_iteration:u8,motor_override_speed_0:u16,motor_override_speed_1:u16,motor_override_speed_2:u16,motor_override_speed_3:u16,motor_override_speed_4:u16,motor_override_speed_5:u16,motor_override_speed_6:u16,motor_override_speed_7:u16,set_command_override:bool,set_state_mask:StateFields,set_state_delay:u16,set_sd_write_delay:u16,set_led:{pattern:u8,color_right:Color,color_left:Color,indicator_red:bool,indicator_green:bool},set_serial_rc:{enabled:bool,command:RcCommand,aux_mask:AuxMask},set_card_recording_state:{/8/record_to_card:void,lock_recording_state:void},set_partial_eeprom_data:Configuration,reinit_partial_eeprom_data:ConfigurationFlag,req_partial_eeprom_data:ConfigurationFlag,req_card_recording_state:void,set_partial_temporary_config:Configuration,set_command_sources:{/8/serial:void,radio:void},set_calibration:{enabled:bool,mode:u8},set_autopilot_enabled:bool,set_usb_mode:u8};DebugString={deprecated_mask:u32,message:s};HistoryData=DebugString;Response={mask:u32,ack:u32};","1.4.txt.json":"{\"version\":{\"major\":1,\"minor\":4,\"patch\":0},\"id\":0,\"pcb_transform\":{\"orientation\":{\"x\":0,\"y\":0,\"z\":0},\"translation\":{\"x\":0,\"y\":0,\"z\":0}},\"mix_table\":{\"fz\":[1,1,1,1,1,1,1,1],\"tx\":[1,1,1,1,-1,-1,-1,-1],\"ty\":[-1,1,-1,1,-1,1,-1,1],\"tz\":[1,-1,-1,1,1,-1,-1,1]},\"mag_bias\":{\"offset\":{\"x\":0,\"y\":0,\"z\":0}},\"channel\":{\"assignment\":{\"thrust\":2,\"pitch\":1,\"roll\":0,\"yaw\":3,\"aux1\":4,\"aux2\":5},\"inversion\":{\"thrust\":null,\"pitch\":true,\"roll\":true,\"yaw\":null,\"aux1\":null,\"aux2\":null},\"midpoint\":[1500,1500,1500,1500,1500,1500],\"deadzone\":[0,0,0,20,0,0]},\"pid_parameters\":{\"thrust_master\":{\"kp\":1.0,\"ki\":0.0,\"kd\":0.0,\"integral_windup_guard\":0.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":1.0},\"pitch_master\":{\"kp\":3.5,\"ki\":0.5,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.005,\"setpoint_filter_time\":0.005,\"command_to_value\":30.0},\"roll_master\":{\"kp\":3.5,\"ki\":0.5,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.005,\"setpoint_filter_time\":0.005,\"command_to_value\":30.0},\"yaw_master\":{\"kp\":1.0,\"ki\":0.0,\"kd\":0.0,\"integral_windup_guard\":0.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":180.0},\"thrust_slave\":{\"kp\":1.0,\"ki\":0.0,\"kd\":0.0,\"integral_windup_guard\":0.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":1.0},\"pitch_slave\":{\"kp\":5.0,\"ki\":2.0,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":150.0},\"roll_slave\":{\"kp\":5.0,\"ki\":2.0,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":150.0},\"yaw_slave\":{\"kp\":40.0,\"ki\":10.0,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":240.0},\"pid_bypass\":{\"thrust_master\":true,\"pitch_master\":null,\"roll_master\":null,\"yaw_master\":true,\"thrust_slave\":true,\"pitch_slave\":null,\"roll_slave\":null,\"yaw_slave\":null}},\"state_parameters\":{\"state_estimation\":[1,0.01],\"enable\":[0.001,30]},\"led_states\":[{\"status\":{\"crash_detected\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Orange}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"loop_slow\":true},\"pattern\":\"${PATTERN_solid}\",\"colors\":\"${COLOR_Red}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"override\":true},\"pattern\":\"${PATTERN_solid}\",\"colors\":\"${COLOR_LightSeaGreen}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"log_full\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Orange}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"no_signal\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Green}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"arming\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Blue}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"armed\":true},\"pattern\":\"${PATTERN_beacon}\",\"colors\":\"${COLOR_Blue}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"idle\":true},\"pattern\":\"${PATTERN_breathe}\",\"colors\":\"${COLOR_Green}\",\"indicator_red\":false,\"indicator_green\":false},\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\"],\"name\":\"FLYBRIX\"}","1.5.txt":"Vector3f={x:f32,y:f32,z:f32};PIDSettings={kp:f32,ki:f32,kd:f32,integral_windup_guard:f32,d_filter_time:f32,setpoint_filter_time:f32,command_to_value:f32};Version={major:u8,minor:u8,patch:u8};ConfigID=u32;PcbTransform={orientation:Vector3f,translation:Vector3f};MixTable={fz:[i8:8],tx:[i8:8],ty:[i8:8],tz:[i8:8]};MagBias={offset:Vector3f};ChannelProperties={assignment:{thrust:u8,pitch:u8,roll:u8,yaw:u8,aux1:u8,aux2:u8},inversion:{/8/thrust:void,pitch:void,roll:void,yaw:void,aux1:void,aux2:void},midpoint:[u16:6],deadzone:[u16:6]};PIDBypass={/8/thrust_master:void,pitch_master:void,roll_master:void,yaw_master:void,thrust_slave:void,pitch_slave:void,roll_slave:void,yaw_slave:void};PIDParameters={thrust_master:PIDSettings,pitch_master:PIDSettings,roll_master:PIDSettings,yaw_master:PIDSettings,thrust_slave:PIDSettings,pitch_slave:PIDSettings,roll_slave:PIDSettings,yaw_slave:PIDSettings,thrust_gain:f32,pitch_gain:f32,roll_gain:f32,yaw_gain:f32,pid_bypass:PIDBypass};StateParameters={state_estimation:[f32:2],enable:[f32:2]};StatusFlag={/16/boot:void,mpu_fail:void,bmp_fail:void,rx_fail:void,idle:void,enabling:void,clear_mpu_bias:void,set_mpu_bias:void,fail_stability:void,fail_angle:void,enabled:void,battery_low:void,temp_warning:void,log_full:void,fail_other:void,override:void};Color={red:u8,green:u8,blue:u8};LEDStateColors={right_front:Color,right_back:Color,left_front:Color,left_back:Color};LEDStateCase={status:StatusFlag,pattern:u8,colors:LEDStateColors,indicator_red:bool,indicator_green:bool};LEDStates=[/16/LEDStateCase:16];LEDStatesFixed=[LEDStateCase:16];DeviceName=s9;Configuration={/16/version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStates,name:DeviceName};ConfigurationFixed={version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStatesFixed,name:DeviceName};ConfigurationFlag={/16/version:void,id:void,pcb_transform:void,mix_table:void,mag_bias:void,channel:void,pid_parameters:void,state_parameters:void,led_states:[//void:16],name:void,velocity_pid_parameters:void,inertial_bias:void};Rotation={pitch:f32,roll:f32,yaw:f32};PIDState={timestamp_us:u32,input:f32,setpoint:f32,p_term:f32,i_term:f32,d_term:f32};RcCommand={throttle:i16,pitch:i16,roll:i16,yaw:i16};State={/32/timestamp_us:u32,status:StatusFlag,v0_raw:u16,i0_raw:u16,i1_raw:u16,accel:Vector3f,gyro:Vector3f,mag:Vector3f,temperature:u16,pressure:u32,ppm:[i16:6],aux_chan_mask:u8,command:RcCommand,control:{fz:f32,tx:f32,ty:f32,tz:f32},pid_master_fz:PIDState,pid_master_tx:PIDState,pid_master_ty:PIDState,pid_master_tz:PIDState,pid_slave_fz:PIDState,pid_slave_tx:PIDState,pid_slave_ty:PIDState,pid_slave_tz:PIDState,motor_out:[i16:8],kinematics_angle:Rotation,kinematics_rate:Rotation,kinematics_altitude:f32,loop_count:u32};StateFields={/32/timestamp_us:void,status:void,v0_raw:void,i0_raw:void,i1_raw:void,accel:void,gyro:void,mag:void,temperature:void,pressure:void,ppm:void,aux_chan_mask:void,command:void,control:void,pid_master_fz:void,pid_master_tx:void,pid_master_ty:void,pid_master_tz:void,pid_slave_fz:void,pid_slave_tx:void,pid_slave_ty:void,pid_slave_tz:void,motor_out:void,kinematics_angle:void,kinematics_rate:void,kinematics_altitude:void,loop_count:void};AuxMask={//aux1_low:void,aux1_mid:void,aux1_high:void,aux2_low:void,aux2_mid:void,aux2_high:void};Command={/32/request_response:void,set_eeprom_data:ConfigurationFixed,reinit_eeprom_data:void,request_eeprom_data:void,request_enable_iteration:u8,motor_override_speed_0:u16,motor_override_speed_1:u16,motor_override_speed_2:u16,motor_override_speed_3:u16,motor_override_speed_4:u16,motor_override_speed_5:u16,motor_override_speed_6:u16,motor_override_speed_7:u16,set_command_override:bool,set_state_mask:StateFields,set_state_delay:u16,set_sd_write_delay:u16,set_led:{pattern:u8,color_right:Color,color_left:Color,indicator_red:bool,indicator_green:bool},set_serial_rc:{enabled:bool,command:RcCommand,aux_mask:AuxMask},set_card_recording_state:{/8/record_to_card:void,lock_recording_state:void},set_partial_eeprom_data:Configuration,reinit_partial_eeprom_data:ConfigurationFlag,req_partial_eeprom_data:ConfigurationFlag,req_card_recording_state:void,set_partial_temporary_config:Configuration,set_command_sources:{/8/serial:void,radio:void},set_calibration:{enabled:bool,mode:u8},set_autopilot_enabled:bool,set_usb_mode:u8};DebugString={deprecated_mask:u32,message:s};HistoryData=DebugString;Response={mask:u32,ack:u32};","1.5.txt.json":"{\"version\":{\"major\":1,\"minor\":5,\"patch\":0},\"id\":0,\"pcb_transform\":{\"orientation\":{\"x\":0,\"y\":0,\"z\":0},\"translation\":{\"x\":0,\"y\":0,\"z\":0}},\"mix_table\":{\"fz\":[1,1,1,1,1,1,1,1],\"tx\":[1,1,1,1,-1,-1,-1,-1],\"ty\":[-1,1,-1,1,-1,1,-1,1],\"tz\":[1,-1,-1,1,1,-1,-1,1]},\"mag_bias\":{\"offset\":{\"x\":0,\"y\":0,\"z\":0}},\"channel\":{\"assignment\":{\"thrust\":2,\"pitch\":1,\"roll\":0,\"yaw\":3,\"aux1\":4,\"aux2\":5},\"inversion\":{\"thrust\":null,\"pitch\":true,\"roll\":true,\"yaw\":null,\"aux1\":null,\"aux2\":null},\"midpoint\":[1500,1500,1500,1500,1500,1500],\"deadzone\":[0,0,0,20,0,0]},\"pid_parameters\":{\"thrust_master\":{\"kp\":1.0,\"ki\":0.0,\"kd\":0.0,\"integral_windup_guard\":0.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":1.0},\"pitch_master\":{\"kp\":3.5,\"ki\":0.5,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.005,\"setpoint_filter_time\":0.005,\"command_to_value\":30.0},\"roll_master\":{\"kp\":3.5,\"ki\":0.5,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.005,\"setpoint_filter_time\":0.005,\"command_to_value\":30.0},\"yaw_master\":{\"kp\":1.0,\"ki\":0.0,\"kd\":0.0,\"integral_windup_guard\":0.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":180.0},\"thrust_slave\":{\"kp\":1.0,\"ki\":0.0,\"kd\":0.0,\"integral_windup_guard\":0.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":1.0},\"pitch_slave\":{\"kp\":5.0,\"ki\":2.0,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":150.0},\"roll_slave\":{\"kp\":5.0,\"ki\":2.0,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":150.0},\"yaw_slave\":{\"kp\":40.0,\"ki\":10.0,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":240.0},\"thrust_gain\":4095,\"pitch_gain\":2047,\"roll_gain\":2047,\"yaw_gain\":2047,\"pid_bypass\":{\"thrust_master\":true,\"pitch_master\":null,\"roll_master\":null,\"yaw_master\":true,\"thrust_slave\":true,\"pitch_slave\":null,\"roll_slave\":null,\"yaw_slave\":null}},\"state_parameters\":{\"state_estimation\":[1,0.01],\"enable\":[0.001,30]},\"led_states\":[{\"status\":{\"crash_detected\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Orange}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"loop_slow\":true},\"pattern\":\"${PATTERN_solid}\",\"colors\":\"${COLOR_Red}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"override\":true},\"pattern\":\"${PATTERN_solid}\",\"colors\":\"${COLOR_LightSeaGreen}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"log_full\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Orange}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"no_signal\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Green}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"arming\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Blue}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"armed\":true},\"pattern\":\"${PATTERN_beacon}\",\"colors\":\"${COLOR_Blue}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"idle\":true},\"pattern\":\"${PATTERN_breathe}\",\"colors\":\"${COLOR_Green}\",\"indicator_red\":false,\"indicator_green\":false},\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\"],\"name\":\"FLYBRIX\"}","1.6.txt":"Vector3f={x:f32,y:f32,z:f32};PIDSettings={kp:f32,ki:f32,kd:f32,integral_windup_guard:f32,d_filter_time:f32,setpoint_filter_time:f32,command_to_value:f32};Version={major:u8,minor:u8,patch:u8};ConfigID=u32;PcbTransform={orientation:Vector3f,translation:Vector3f};MixTable={fz:[i8:8],tx:[i8:8],ty:[i8:8],tz:[i8:8]};MagBias={offset:Vector3f};ChannelProperties={assignment:{thrust:u8,pitch:u8,roll:u8,yaw:u8,aux1:u8,aux2:u8},inversion:{/8/thrust:void,pitch:void,roll:void,yaw:void,aux1:void,aux2:void},midpoint:[u16:6],deadzone:[u16:6]};PIDBypass={/8/thrust_master:void,pitch_master:void,roll_master:void,yaw_master:void,thrust_slave:void,pitch_slave:void,roll_slave:void,yaw_slave:void};PIDParameters={thrust_master:PIDSettings,pitch_master:PIDSettings,roll_master:PIDSettings,yaw_master:PIDSettings,thrust_slave:PIDSettings,pitch_slave:PIDSettings,roll_slave:PIDSettings,yaw_slave:PIDSettings,thrust_gain:f32,pitch_gain:f32,roll_gain:f32,yaw_gain:f32,pid_bypass:PIDBypass};StateParameters={state_estimation:[f32:2],enable:[f32:2]};StatusFlag={/16/_0:void,_1:void,_2:void,no_signal:void,idle:void,arming:void,recording_sd:void,_7:void,loop_slow:void,_9:void,armed:void,battery_low:void,battery_critical:void,log_full:void,crash_detected:void,override:void};Color={red:u8,green:u8,blue:u8};LEDStateColors={right_front:Color,right_back:Color,left_front:Color,left_back:Color};LEDStateCase={status:StatusFlag,pattern:u8,colors:LEDStateColors,indicator_red:bool,indicator_green:bool};LEDStates=[/16/LEDStateCase:16];LEDStatesFixed=[LEDStateCase:16];DeviceName=s9;InertialBias={accel:Vector3f,gyro:Vector3f};VelocityPIDBypass={/8/forward_master:void,right_master:void,up_master:void,_unused_master:void,forward_slave:void,right_slave:void,up_slave:void,_unused_slave:void};VelocityPIDParameters={forward_master:PIDSettings,right_master:PIDSettings,up_master:PIDSettings,forward_slave:PIDSettings,right_slave:PIDSettings,up_slave:PIDSettings,pid_bypass:VelocityPIDBypass};Configuration={/16/version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStates,name:DeviceName,velocity_pid_parameters:VelocityPIDParameters,inertial_bias:InertialBias};ConfigurationFixed={version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStatesFixed,name:DeviceName,velocity_pid_parameters:VelocityPIDParameters,inertial_bias:InertialBias};ConfigurationFlag={/16/version:void,id:void,pcb_transform:void,mix_table:void,mag_bias:void,channel:void,pid_parameters:void,state_parameters:void,led_states:[//void:16],name:void,velocity_pid_parameters:void,inertial_bias:void};Rotation={pitch:f32,roll:f32,yaw:f32};PIDState={timestamp_us:u32,input:f32,setpoint:f32,p_term:f32,i_term:f32,d_term:f32};RcCommand={throttle:i16,pitch:i16,roll:i16,yaw:i16};State={/32/timestamp_us:u32,status:StatusFlag,v0_raw:u16,i0_raw:u16,i1_raw:u16,accel:Vector3f,gyro:Vector3f,mag:Vector3f,temperature:u16,pressure:u32,ppm:[i16:6],aux_chan_mask:u8,command:RcCommand,control:{fz:f32,tx:f32,ty:f32,tz:f32},pid_master_fz:PIDState,pid_master_tx:PIDState,pid_master_ty:PIDState,pid_master_tz:PIDState,pid_slave_fz:PIDState,pid_slave_tx:PIDState,pid_slave_ty:PIDState,pid_slave_tz:PIDState,motor_out:[i16:8],kinematics_angle:Rotation,kinematics_rate:Rotation,kinematics_altitude:f32,loop_count:u32};StateFields={/32/timestamp_us:void,status:void,v0_raw:void,i0_raw:void,i1_raw:void,accel:void,gyro:void,mag:void,temperature:void,pressure:void,ppm:void,aux_chan_mask:void,command:void,control:void,pid_master_fz:void,pid_master_tx:void,pid_master_ty:void,pid_master_tz:void,pid_slave_fz:void,pid_slave_tx:void,pid_slave_ty:void,pid_slave_tz:void,motor_out:void,kinematics_angle:void,kinematics_rate:void,kinematics_altitude:void,loop_count:void};AuxMask={//aux1_low:void,aux1_mid:void,aux1_high:void,aux2_low:void,aux2_mid:void,aux2_high:void};Command={/32/request_response:void,set_eeprom_data:ConfigurationFixed,reinit_eeprom_data:void,request_eeprom_data:void,request_enable_iteration:u8,motor_override_speed_0:u16,motor_override_speed_1:u16,motor_override_speed_2:u16,motor_override_speed_3:u16,motor_override_speed_4:u16,motor_override_speed_5:u16,motor_override_speed_6:u16,motor_override_speed_7:u16,set_command_override:bool,set_state_mask:StateFields,set_state_delay:u16,set_sd_write_delay:u16,set_led:{pattern:u8,color_right:Color,color_left:Color,indicator_red:bool,indicator_green:bool},set_serial_rc:{enabled:bool,command:RcCommand,aux_mask:AuxMask},set_card_recording_state:{/8/record_to_card:void,lock_recording_state:void},set_partial_eeprom_data:Configuration,reinit_partial_eeprom_data:ConfigurationFlag,req_partial_eeprom_data:ConfigurationFlag,req_card_recording_state:void,set_partial_temporary_config:Configuration,set_command_sources:{/8/serial:void,radio:void},set_calibration:{enabled:bool,mode:u8},set_autopilot_enabled:bool,set_usb_mode:u8};DebugString={deprecated_mask:u32,message:s};HistoryData=DebugString;Response={mask:u32,ack:u32};","1.6.txt.json":"{\"version\":{\"major\":1,\"minor\":6,\"patch\":0},\"id\":0,\"pcb_transform\":{\"orientation\":{\"x\":0,\"y\":0,\"z\":0},\"translation\":{\"x\":0,\"y\":0,\"z\":0}},\"mix_table\":{\"fz\":[1,1,1,1,1,1,1,1],\"tx\":[1,1,1,1,-1,-1,-1,-1],\"ty\":[-1,1,-1,1,-1,1,-1,1],\"tz\":[1,-1,-1,1,1,-1,-1,1]},\"mag_bias\":{\"offset\":{\"x\":0,\"y\":0,\"z\":0}},\"channel\":{\"assignment\":{\"thrust\":2,\"pitch\":1,\"roll\":0,\"yaw\":3,\"aux1\":4,\"aux2\":5},\"inversion\":{\"thrust\":null,\"pitch\":true,\"roll\":true,\"yaw\":null,\"aux1\":null,\"aux2\":null},\"midpoint\":[1500,1500,1500,1500,1500,1500],\"deadzone\":[0,0,0,20,0,0]},\"pid_parameters\":{\"thrust_master\":{\"kp\":1.0,\"ki\":0.0,\"kd\":0.0,\"integral_windup_guard\":0.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":1.0},\"pitch_master\":{\"kp\":3.5,\"ki\":0.5,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.005,\"setpoint_filter_time\":0.005,\"command_to_value\":30.0},\"roll_master\":{\"kp\":3.5,\"ki\":0.5,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.005,\"setpoint_filter_time\":0.005,\"command_to_value\":30.0},\"yaw_master\":{\"kp\":1.0,\"ki\":0.0,\"kd\":0.0,\"integral_windup_guard\":0.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":180.0},\"thrust_slave\":{\"kp\":1.0,\"ki\":0.0,\"kd\":0.0,\"integral_windup_guard\":0.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":1.0},\"pitch_slave\":{\"kp\":5.0,\"ki\":2.0,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":150.0},\"roll_slave\":{\"kp\":5.0,\"ki\":2.0,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":150.0},\"yaw_slave\":{\"kp\":40.0,\"ki\":10.0,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":240.0},\"thrust_gain\":4095,\"pitch_gain\":2047,\"roll_gain\":2047,\"yaw_gain\":2047,\"pid_bypass\":{\"thrust_master\":true,\"pitch_master\":null,\"roll_master\":null,\"yaw_master\":true,\"thrust_slave\":true,\"pitch_slave\":null,\"roll_slave\":null,\"yaw_slave\":null}},\"state_parameters\":{\"state_estimation\":[1,0.01],\"enable\":[0.001,30]},\"led_states\":[{\"status\":{\"crash_detected\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Orange}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"loop_slow\":true},\"pattern\":\"${PATTERN_solid}\",\"colors\":\"${COLOR_Red}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"override\":true},\"pattern\":\"${PATTERN_solid}\",\"colors\":\"${COLOR_LightSeaGreen}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"log_full\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Orange}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"no_signal\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Green}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"arming\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Blue}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"armed\":true},\"pattern\":\"${PATTERN_beacon}\",\"colors\":\"${COLOR_Blue}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"idle\":true},\"pattern\":\"${PATTERN_breathe}\",\"colors\":\"${COLOR_Green}\",\"indicator_red\":false,\"indicator_green\":false},\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\"],\"name\":\"FLYBRIX\",\"velocity_pid_parameters\":{\"forward_master\":{\"kp\":1,\"ki\":0,\"kd\":0,\"integral_windup_guard\":0,\"d_filter_time\":0.005,\"setpoint_filter_time\":0.005,\"command_to_value\":1},\"right_master\":{\"kp\":10,\"ki\":1,\"kd\":0,\"integral_windup_guard\":10,\"d_filter_time\":0.005,\"setpoint_filter_time\":0.005,\"command_to_value\":10},\"up_master\":{\"kp\":10,\"ki\":1,\"kd\":0,\"integral_windup_guard\":10,\"d_filter_time\":0.005,\"setpoint_filter_time\":0.005,\"command_to_value\":10},\"forward_slave\":{\"kp\":1,\"ki\":0,\"kd\":0,\"integral_windup_guard\":10,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":0.3},\"right_slave\":{\"kp\":10,\"ki\":4,\"kd\":0,\"integral_windup_guard\":30,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":30},\"up_slave\":{\"kp\":10,\"ki\":4,\"kd\":0,\"integral_windup_guard\":30,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":30},\"pid_bypass\":{\"forward_master\":true,\"right_master\":true,\"up_master\":true,\"forward_slave\":true,\"right_slave\":true,\"up_slave\":true}},\"inertial_bias\":{\"accel\":{\"x\":0,\"y\":0,\"z\":0},\"gyro\":{\"x\":0,\"y\":0,\"z\":0}}}","1.7.txt":"Vector3f={x:f32,y:f32,z:f32};PIDSettings={kp:f32,ki:f32,kd:f32,integral_windup_guard:f32,d_filter_time:f32,setpoint_filter_time:f32,command_to_value:f32};Version={major:u8,minor:u8,patch:u8};ConfigID=u32;PcbTransform={orientation:Vector3f,translation:Vector3f};MixTable={fz:[i8:8],tx:[i8:8],ty:[i8:8],tz:[i8:8]};MagBias={offset:Vector3f};ChannelProperties={assignment:{thrust:u8,pitch:u8,roll:u8,yaw:u8,aux1:u8,aux2:u8},inversion:{/8/thrust:void,pitch:void,roll:void,yaw:void,aux1:void,aux2:void},midpoint:[u16:6],deadzone:[u16:6]};PIDBypass={/8/thrust_master:void,pitch_master:void,roll_master:void,yaw_master:void,thrust_slave:void,pitch_slave:void,roll_slave:void,yaw_slave:void};PIDParameters={thrust_master:PIDSettings,pitch_master:PIDSettings,roll_master:PIDSettings,yaw_master:PIDSettings,thrust_slave:PIDSettings,pitch_slave:PIDSettings,roll_slave:PIDSettings,yaw_slave:PIDSettings,thrust_gain:f32,pitch_gain:f32,roll_gain:f32,yaw_gain:f32,pid_bypass:PIDBypass};StateParameters={state_estimation:[f32:2],enable:[f32:2]};StatusFlag={/16/_0:void,_1:void,_2:void,no_signal:void,idle:void,arming:void,recording_sd:void,_7:void,loop_slow:void,_9:void,armed:void,battery_low:void,battery_critical:void,log_full:void,crash_detected:void,override:void};Color={red:u8,green:u8,blue:u8};LEDStateColors={right_front:Color,right_back:Color,left_front:Color,left_back:Color};LEDStateCase={status:StatusFlag,pattern:u8,colors:LEDStateColors,indicator_red:bool,indicator_green:bool};LEDStates=[/16/LEDStateCase:16];LEDStatesFixed=[LEDStateCase:16];DeviceName=s9;InertialBias={accel:Vector3f,gyro:Vector3f};VelocityPIDBypass={/8/forward_master:void,right_master:void,up_master:void,_unused_master:void,forward_slave:void,right_slave:void,up_slave:void,_unused_slave:void};VelocityPIDParameters={forward_master:PIDSettings,right_master:PIDSettings,up_master:PIDSettings,forward_slave:PIDSettings,right_slave:PIDSettings,up_slave:PIDSettings,pid_bypass:VelocityPIDBypass};Configuration={/16/version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStates,name:DeviceName,velocity_pid_parameters:VelocityPIDParameters,inertial_bias:InertialBias};ConfigurationFixed={version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStatesFixed,name:DeviceName,velocity_pid_parameters:VelocityPIDParameters,inertial_bias:InertialBias};ConfigurationFlag={/16/version:void,id:void,pcb_transform:void,mix_table:void,mag_bias:void,channel:void,pid_parameters:void,state_parameters:void,led_states:[//void:16],name:void,velocity_pid_parameters:void,inertial_bias:void};Rotation={pitch:f32,roll:f32,yaw:f32};PIDState={timestamp_us:u32,input:f32,setpoint:f32,p_term:f32,i_term:f32,d_term:f32};RcCommand={throttle:i16,pitch:i16,roll:i16,yaw:i16};State={/32/timestamp_us:u32,status:StatusFlag,v0_raw:u16,i0_raw:u16,i1_raw:u16,accel:Vector3f,gyro:Vector3f,mag:Vector3f,temperature:u16,pressure:u32,ppm:[i16:6],aux_chan_mask:u8,command:RcCommand,control:{fz:f32,tx:f32,ty:f32,tz:f32},pid_master_fz:PIDState,pid_master_tx:PIDState,pid_master_ty:PIDState,pid_master_tz:PIDState,pid_slave_fz:PIDState,pid_slave_tx:PIDState,pid_slave_ty:PIDState,pid_slave_tz:PIDState,motor_out:[i16:8],kinematics_angle:Rotation,kinematics_rate:Rotation,kinematics_altitude:f32,loop_count:u32};StateFields={/32/timestamp_us:void,status:void,v0_raw:void,i0_raw:void,i1_raw:void,accel:void,gyro:void,mag:void,temperature:void,pressure:void,ppm:void,aux_chan_mask:void,command:void,control:void,pid_master_fz:void,pid_master_tx:void,pid_master_ty:void,pid_master_tz:void,pid_slave_fz:void,pid_slave_tx:void,pid_slave_ty:void,pid_slave_tz:void,motor_out:void,kinematics_angle:void,kinematics_rate:void,kinematics_altitude:void,loop_count:void};AuxMask={//aux1_low:void,aux1_mid:void,aux1_high:void,aux2_low:void,aux2_mid:void,aux2_high:void};Command={/32/request_response:void,set_eeprom_data:ConfigurationFixed,reinit_eeprom_data:void,request_eeprom_data:void,request_enable_iteration:u8,motor_override_speed_0:u16,motor_override_speed_1:u16,motor_override_speed_2:u16,motor_override_speed_3:u16,motor_override_speed_4:u16,motor_override_speed_5:u16,motor_override_speed_6:u16,motor_override_speed_7:u16,set_command_override:bool,set_state_mask:StateFields,set_state_delay:u16,set_sd_write_delay:u16,set_led:{pattern:u8,color_right_front:Color,color_left_front:Color,color_right_back:Color,color_left_back:Color,indicator_red:bool,indicator_green:bool},set_serial_rc:{enabled:bool,command:RcCommand,aux_mask:AuxMask},set_card_recording_state:{/8/record_to_card:void,lock_recording_state:void},set_partial_eeprom_data:Configuration,reinit_partial_eeprom_data:ConfigurationFlag,req_partial_eeprom_data:ConfigurationFlag,req_card_recording_state:void,set_partial_temporary_config:Configuration,set_command_sources:{/8/serial:void,radio:void},set_calibration:{enabled:bool,mode:u8},set_autopilot_enabled:bool,set_usb_mode:u8};DebugString={deprecated_mask:u32,message:s};HistoryData=DebugString;Response={mask:u32,ack:u32};","1.7.txt.json":"{\"version\":{\"major\":1,\"minor\":7,\"patch\":0},\"id\":0,\"pcb_transform\":{\"orientation\":{\"x\":0,\"y\":0,\"z\":0},\"translation\":{\"x\":0,\"y\":0,\"z\":0}},\"mix_table\":{\"fz\":[1,1,1,1,1,1,1,1],\"tx\":[1,1,1,1,-1,-1,-1,-1],\"ty\":[-1,1,-1,1,-1,1,-1,1],\"tz\":[1,-1,-1,1,1,-1,-1,1]},\"mag_bias\":{\"offset\":{\"x\":0,\"y\":0,\"z\":0}},\"channel\":{\"assignment\":{\"thrust\":2,\"pitch\":1,\"roll\":0,\"yaw\":3,\"aux1\":4,\"aux2\":5},\"inversion\":{\"thrust\":null,\"pitch\":true,\"roll\":true,\"yaw\":null,\"aux1\":null,\"aux2\":null},\"midpoint\":[1500,1500,1500,1500,1500,1500],\"deadzone\":[0,0,0,20,0,0]},\"pid_parameters\":{\"thrust_master\":{\"kp\":1.0,\"ki\":0.0,\"kd\":0.0,\"integral_windup_guard\":0.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":1.0},\"pitch_master\":{\"kp\":3.5,\"ki\":0.5,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.005,\"setpoint_filter_time\":0.005,\"command_to_value\":30.0},\"roll_master\":{\"kp\":3.5,\"ki\":0.5,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.005,\"setpoint_filter_time\":0.005,\"command_to_value\":30.0},\"yaw_master\":{\"kp\":1.0,\"ki\":0.0,\"kd\":0.0,\"integral_windup_guard\":0.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":180.0},\"thrust_slave\":{\"kp\":1.0,\"ki\":0.0,\"kd\":0.0,\"integral_windup_guard\":0.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":1.0},\"pitch_slave\":{\"kp\":5.0,\"ki\":2.0,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":150.0},\"roll_slave\":{\"kp\":5.0,\"ki\":2.0,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":150.0},\"yaw_slave\":{\"kp\":40.0,\"ki\":10.0,\"kd\":0.0,\"integral_windup_guard\":300.0,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":240.0},\"thrust_gain\":4095,\"pitch_gain\":2047,\"roll_gain\":2047,\"yaw_gain\":2047,\"pid_bypass\":{\"thrust_master\":true,\"pitch_master\":null,\"roll_master\":null,\"yaw_master\":true,\"thrust_slave\":true,\"pitch_slave\":null,\"roll_slave\":null,\"yaw_slave\":null}},\"state_parameters\":{\"state_estimation\":[1,0.01],\"enable\":[0.001,30]},\"led_states\":[{\"status\":{\"crash_detected\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Orange}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"loop_slow\":true},\"pattern\":\"${PATTERN_solid}\",\"colors\":\"${COLOR_Red}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"override\":true},\"pattern\":\"${PATTERN_solid}\",\"colors\":\"${COLOR_LightSeaGreen}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"log_full\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Orange}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"no_signal\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Green}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"arming\":true},\"pattern\":\"${PATTERN_flash}\",\"colors\":\"${COLOR_Blue}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"armed\":true},\"pattern\":\"${PATTERN_beacon}\",\"colors\":\"${COLOR_Blue}\",\"indicator_red\":false,\"indicator_green\":false},{\"status\":{\"idle\":true},\"pattern\":\"${PATTERN_breathe}\",\"colors\":\"${COLOR_Green}\",\"indicator_red\":false,\"indicator_green\":false},\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\",\"${LED_unused_mode}\"],\"name\":\"FLYBRIX\",\"velocity_pid_parameters\":{\"forward_master\":{\"kp\":1,\"ki\":0,\"kd\":0,\"integral_windup_guard\":0,\"d_filter_time\":0.005,\"setpoint_filter_time\":0.005,\"command_to_value\":1},\"right_master\":{\"kp\":10,\"ki\":1,\"kd\":0,\"integral_windup_guard\":10,\"d_filter_time\":0.005,\"setpoint_filter_time\":0.005,\"command_to_value\":10},\"up_master\":{\"kp\":10,\"ki\":1,\"kd\":0,\"integral_windup_guard\":10,\"d_filter_time\":0.005,\"setpoint_filter_time\":0.005,\"command_to_value\":10},\"forward_slave\":{\"kp\":1,\"ki\":0,\"kd\":0,\"integral_windup_guard\":10,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":0.3},\"right_slave\":{\"kp\":10,\"ki\":4,\"kd\":0,\"integral_windup_guard\":30,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":30},\"up_slave\":{\"kp\":10,\"ki\":4,\"kd\":0,\"integral_windup_guard\":30,\"d_filter_time\":0.001,\"setpoint_filter_time\":0.001,\"command_to_value\":30},\"pid_bypass\":{\"forward_master\":true,\"right_master\":true,\"up_master\":true,\"forward_slave\":true,\"right_slave\":true,\"up_slave\":true}},\"inertial_bias\":{\"accel\":{\"x\":0,\"y\":0,\"z\":0},\"gyro\":{\"x\":0,\"y\":0,\"z\":0}}}"};
        return { versions: versions, files: files };
    }
}());
(function() {
    'use strict';

    angular.module('flybrixCommon').factory('calibration', calibration);

    calibration.$inject = ['commandLog', 'serial'];

    function calibration(commandLog, serial) {
        return {
            magnetometer: magnetometer,
            accelerometer: {
                flat: calibrateAccelerometer.bind(null, 'flat', 0),
                forward: calibrateAccelerometer.bind(null, 'lean forward', 1),
                back: calibrateAccelerometer.bind(null, 'lean back', 2),
                right: calibrateAccelerometer.bind(null, 'lean right', 3),
                left: calibrateAccelerometer.bind(null, 'lean left', 4),
            },
            finish: finish,
        };

        function magnetometer() {
            commandLog("Calibrating magnetometer bias");
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: true,
                    mode: 0,
                },
            }, false);
        }

        function calibrateAccelerometer(poseDescription, poseId) {
            commandLog("Calibrating gravity for pose: " + poseDescription);
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: true,
                    mode: poseId + 1,
                },
            }, false);
        }

        function finish() {
            commandLog("Finishing calibration");
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: false,
                    mode: 0,
                },
            }, false);
        }
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('cobs', cobs);

    function cobs() {
        return {
            Reader: Reader,
            encode: encode,
        };
    }


    function Reader(capacity) {
        if (capacity === undefined) {
            capacity = 2000;
        }
        this.N = capacity;
        this.buffer = new Uint8Array(capacity);
        this.ready_for_new_message = true;
        this.buffer_length = 0;
    }

    function cobsDecode(reader) {
        var src_ptr = 0;
        var dst_ptr = 0;
        var leftover_length = 0;
        var append_zero = false;
        while (reader.buffer[src_ptr]) {
            if (!leftover_length) {
                if (append_zero)
                    reader.buffer[dst_ptr++] = 0;
                leftover_length = reader.buffer[src_ptr++] - 1;
                append_zero = leftover_length < 0xFE;
            } else {
                --leftover_length;
                reader.buffer[dst_ptr++] = reader.buffer[src_ptr++];
            }
        }

        return leftover_length ? 0 : dst_ptr;
    }

    Reader.prototype.readBytes = function(data, onSuccess, onError) {
        for (var i = 0; i < data.length; i++) {
            var c = data[i];
            if (this.ready_for_new_message) {
                // first byte of a new message
                this.ready_for_new_message = false;
                this.buffer_length = 0;
            }

            this.buffer[this.buffer_length++] = c;

            if (c) {
                if (this.buffer_length === this.N) {
                    // buffer overflow, probably due to errors in data
                    onError('overflow', 'buffer overflow in COBS decoding');
                    this.ready_for_new_message = true;
                }
                continue;
            }

            this.buffer_length = cobsDecode(this);
            var failed_decode = (this.buffer_length === 0);
            if (failed_decode) {
                this.buffer[0] = 1;
            }
            var j;
            for (j = 1; j < this.buffer_length; ++j) {
                this.buffer[0] ^= this.buffer[j];
            }
            if (this.buffer[0] === 0) {  // check sum is correct
                this.ready_for_new_message = true;
                if (this.buffer_length > 0) {
                    onSuccess(this.buffer.slice(1, this.buffer_length));
                } else {
                    onError('short', 'Too short packet');
                }
            } else {  // bad checksum
                this.ready_for_new_message = true;
                var bytes = "";
                var message = "";
                for (j = 0; j < this.buffer_length; j++) {
                    bytes += this.buffer[j] + ",";
                    message += String.fromCharCode(this.buffer[j]);
                }
                if (failed_decode) {
                    onError('frame', 'Unexpected ending of packet');
                } else {
                    var msg = 'BAD CHECKSUM (' + this.buffer_length +
                        ' bytes)' + bytes + message;
                    onError('checksum', msg);
                }
            }
        }
    };

    function encode(buf) {
        var retval =
            new Uint8Array(Math.floor((buf.byteLength * 255 + 761) / 254));
        var len = 1;
        var pos_ctr = 0;
        for (var i = 0; i < buf.length; ++i) {
            if (retval[pos_ctr] == 0xFE) {
                retval[pos_ctr] = 0xFF;
                pos_ctr = len++;
                retval[pos_ctr] = 0;
            }
            var val = buf[i];
            ++retval[pos_ctr];
            if (val) {
                retval[len++] = val;
            } else {
                pos_ctr = len++;
                retval[pos_ctr] = 0;
            }
        }
        return retval.subarray(0, len).slice().buffer;
    };
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('commandLog', commandLog);

    commandLog.$inject = ['$q'];

    function commandLog($q) {
        var messages = [];
        var responder = $q.defer();

        var service = log;
        service.log = log;
        service.clearSubscribers = clearSubscribers;
        service.onMessage = onMessage;
        service.read = read;

        return service;

        function log(message) {
            if (message !== undefined) {
                messages.push(message);
                responder.notify(read());
            }
        }

        function read() {
            return messages;
        }

        function clearSubscribers() {
            responder = $q.defer();
        }

        function onMessage(callback) {
            return responder.promise.then(undefined, undefined, callback);
        }
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('deviceConfig', deviceConfig);

    deviceConfig.$inject = ['serial', 'commandLog', 'firmwareVersion', 'serializationHandler'];

    function deviceConfig(serial, commandLog, firmwareVersion, serializationHandler) {
        var config;

        var configCallback = function() {
            commandLog('No callback defined for receiving configurations!');
        };

        var loggingCallback = function() {
            commandLog(
                'No callback defined for receiving logging state!' +
                ' Callback arguments: (isLogging, isLocked, delay)');
        };

        serial.addOnReceiveCallback(function(messageType, message) {
            if (messageType !== 'Command') {
                return;
            }
            if ('set_eeprom_data' in message) {
                updateConfigFromRemoteData(message.set_eeprom_data);
            }
            if ('set_partial_eeprom_data' in message) {
                updateConfigFromRemoteData(message.set_partial_eeprom_data);
            }
            if (('set_card_recording_state' in message) && ('set_sd_write_delay' in message)) {
                var card_rec_state = message.set_card_recording_state;
                var sd_write_delay = message.set_sd_write_delay;
                loggingCallback(card_rec_state.record_to_card, card_rec_state.lock_recording_state, sd_write_delay);
            }
        });

        function getDesiredVersion() {
            return firmwareVersion.desired();
        }


        function request() {
            var handlers = firmwareVersion.serializationHandler();
            commandLog('Requesting current configuration data...');
            return serial.sendStructure('Command', {
                request_response: true,
                req_partial_eeprom_data: handlers.ConfigurationFlag.empty(),
            }, false);
        }

        function reinit() {
            commandLog('Setting factory default configuration data...');
            return serial.sendStructure('Command', {
                request_response: true,
                reinit_eeprom_data: true,
            }, false)
                .then(
                    function() {
                        return request();
                    },
                    function(reason) {
                        commandLog(
                            'Request for factory reset failed: ' + reason);
                    });
        }

        function send(newConfig) {
            return sendConfig({ config: newConfig, temporary: false, requestUpdate: true });
        }

        function sendConfig(properties) {
            var handlers = firmwareVersion.serializationHandler();
            var mask = properties.mask || handlers.ConfigurationFlag.empty();
            var newConfig = properties.config || config;
            var requestUpdate = properties.requestUpdate || false;
            var message = {
                request_response: true,
            };
            if (properties.temporary) {
                message.set_partial_temporary_config = newConfig;
                mask = { set_partial_temporary_config: mask };
            } else {
                message.set_partial_eeprom_data = newConfig;
                mask = { set_partial_eeprom_data: mask };
            }
            return serial.sendStructure('Command', message, true, mask).then(function() {
                if (requestUpdate) {
                    request();
                }
            });
        }

        function updateConfigFromRemoteData(configChanges) {
            //commandLog('Received config!');
            config = serializationHandler.updateFields(config, configChanges);
            var version = [config.version.major, config.version.minor, config.version.patch];
            firmwareVersion.set(version);
            if (!firmwareVersion.supported()) {
                commandLog('Received an unsupported configuration!');
                commandLog(
                    'Found version: ' + version[0] + '.' + version[1] + '.' + version[2]  +
                    ' --- Newest version: ' +
                    firmwareVersion.desiredKey() );
            } else {
                commandLog(
                    'Received configuration data (v' +
                    version[0] + '.' + version[1] + '.' + version[2] +')');
                configCallback();
            }
        }

        function setConfigCallback(callback) {
            configCallback = callback;
        }

        function setLoggingCallback(callback) {
            loggingCallback = callback;
        }

        function getConfig() {
            return config;
        }

        config = firmwareVersion.serializationHandler().Configuration.empty();

        return {
            request: request,
            reinit: reinit,
            send: send,
            sendConfig: sendConfig,
            getConfig: getConfig,
            setConfigCallback: setConfigCallback,
            setLoggingCallback: setLoggingCallback,
            getDesiredVersion: getDesiredVersion,
        };
    }
}());

(function () {
    'use strict';

    angular.module('flybrixCommon').factory('deviceConfigParser', deviceConfigParser);

    deviceConfigParser.$inject = [];

    function deviceConfigParser() {
        var constants = {};

        var patterns = {
            none: 0,
            solid: 5,
            flash: 1,
            breathe: 3,
            beacon: 2,
            alternate: 4,
        };

        Object.keys(patterns).forEach(function (key) {
            constants['PATTERN_' + key] = JSON.stringify(patterns[key]);
        });

        var color_palette = {
            Plaid: {red: 204, green: 85, blue: 51},
            DarkMagenta: {red: 139, green: 0, blue: 139},
            Red: {red: 255, green: 0, blue: 0},
            OrangeRed: {red: 255, green: 69, blue: 0},
            Orange: {red: 255, green: 165, blue: 0},
            Yellow: {red: 255, green: 255, blue: 0},
            White: {red: 255, green: 255, blue: 255},
            Black: {red: 0, green: 0, blue: 0},
            Blue: {red: 0, green: 0, blue: 255},
            LightSeaGreen: {red: 32, green: 178, blue: 170},
            Green: {red: 0, green: 128, blue: 0},
        };

        function uniformFadedColor(c) {
            var scale = (256.0 - 230.0) / 256.0; // matches fade function in firmware
            var r = Math.max(0, Math.min(255, Math.round(scale * c.red)));
            var g = Math.max(0, Math.min(255, Math.round(scale * c.green)));
            var b = Math.max(0, Math.min(255, Math.round(scale * c.blue)));
            return {
                right_front: {red: r, green: g, blue: b},
                right_back: {red: r, green: g, blue: b},
                left_front: {red: r, green: g, blue: b},
                left_back: {red: r, green: g, blue: b}
            };
        }

        Object.keys(color_palette).forEach(function (key) {
            constants['COLOR_' + key] = JSON.stringify(uniformFadedColor(color_palette[key]));
        });

        constants['LED_unused_mode'] = '{"status":{},"pattern":' + constants.PATTERN_none + ',"colors":' + constants.COLOR_Black + ',"indicator_red":false,"indicator_green":false}';

        var regex = /"\${(\w+)}"/g;

        var const_filler = function (full_match, label) {
            if (label in constants) {
                return constants[label];
            }
            throw new Error('Constant "' + label + '" is not supported by this version of flybrix-common.');
        };

        var parse = function (data) {
            return JSON.parse(data.replace(regex, const_filler));
        };

        return {parse: parse};
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('firmwareVersion', firmwareVersion);

    firmwareVersion.$inject = ['serializationHandler'];

    function firmwareVersion(serializationHandler) {
        var version = [0, 0, 0];
        var key = '0.0.0';

        var newestVersion = serializationHandler.getNewestVersion();

        var desired = [newestVersion.major, newestVersion.minor, newestVersion.patch];
        var desiredKey = desired[0].toString() + '.' + desired[1].toString() + '.' + desired[2].toString();

        var defaultSerializationHandler = serializationHandler.getHandler(desiredKey);
        var defaultDefaults = serializationHandler.getDefaults(desiredKey);
        var currentSerializationHandler = defaultSerializationHandler;
        var currentDefaults = defaultDefaults;

        return {
            set: function(value) {
                version = value;
                key = value.join('.');
                currentSerializationHandler = serializationHandler.getHandler(desiredKey) || defaultSerializationHandler;
                currentDefaults = serializationHandler.getDefaults(desiredKey) || defaultDefaults;
            },
            get: function() {
                return version;
            },
            key: function() {
                return key;
            },
            supported: function() {
                return !!serializationHandler.getHandler(key);
            },
            desired: function() {
                return desired;
            },
            desiredKey: function() {
                return desiredKey;
            },
            serializationHandler: function() {
                return currentSerializationHandler;
            },
            defaults: function() {
                return currentDefaults;
            },
        };
    }

}());

(function () {
    'use strict';

    angular.module('flybrixCommon').factory('led', led);

    led.$inject = ['$q', 'serial'];

    function led($q, serial) {
        var LedPatterns = {
            NO_OVERRIDE: 0,
            FLASH: 1,
            BEACON: 2,
            BREATHE: 3,
            ALTERNATE: 4,
            SOLID: 5,
        };

        var urgent = false;
        var black = {red: 0, green: 0, blue: 0};

        function set(right_front, right_back, left_front, left_back, pattern, red, green) {
            if (!urgent && serial.busy()) {
                return $q.reject('Serial connection is too busy');
            }
            urgent = false;

            pattern = pattern || LedPatterns.NO_OVERRIDE;
            if (pattern < 0) {
                pattern = LedPatterns.NO_OVERRIDE;
            } else if (pattern > 5) {
                pattern = LedPatterns.SOLID;
            }

            var setter_command = {
                pattern: pattern,
                color_right: right_front || black,
                color_left: left_front || black,
                color_right_front: right_front || black,
                color_left_front: left_front || black,
                color_right_back: right_back || black,
                color_left_back: left_back || black,
                indicator_red: red,
                indicator_green: green,
            };

            return serial.sendStructure('Command', {
                request_response: true,
                set_led: setter_command,
            }, false);
        }

        function setSimple(red, green, blue) {
            var color = {red: red || 0, green: green || 0, blue: blue || 0};
            return set(color, color, color, color, LedPatterns.SOLID);
        }

        function clear() {
            forceNextSend();
            return set();
        }

        function forceNextSend() {
            urgent = true;
        }

        return {
            set: set,
            setSimple: setSimple,
            clear: clear,
            patterns: LedPatterns,
            forceNextSend: forceNextSend,
        };
    }

}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('rcData', rcData);

    rcData.$inject = ['serial'];

    function rcData(serial) {
        var AUX = {
            LOW: 0,
            MID: 1,
            HIGH: 2,
        };
        var auxNames = ['low', 'mid', 'high'];

        var throttle = -1;
        var pitch = 0;
        var roll = 0;
        var yaw = 0;
        // defaults to high -- low is enabling; high is disabling
        var aux1 = AUX.HIGH;
        // defaults to ?? -- need to check transmitter behavior
        var aux2 = AUX.HIGH;

        var urgent = true;

        return {
            setThrottle: setThrottle,
            setPitch: setPitch,
            setRoll: setRoll,
            setYaw: setYaw,
            setAux1: setAux1,
            setAux2: setAux2,
            getThrottle: getThrottle,
            getPitch: getPitch,
            getRoll: getRoll,
            getYaw: getYaw,
            getAux1: getAux1,
            getAux2: getAux2,
            AUX: AUX,
            send: send,
            forceNextSend: forceNextSend,
        };

        function send() {
            if (!urgent && serial.busy()) {
                return;
            }
            urgent = false;

            var command = {};

            // invert pitch and roll
            var throttle_threshold =
                -0.8;  // keep bottom 10% of throttle stick to mean 'off'
            command.throttle = constrain(
                (throttle - throttle_threshold) * 4095 /
                    (1 - throttle_threshold),
                0, 4095);
            command.pitch =
                constrain(-(applyDeadzone(pitch, 0.1)) * 4095 / 2, -2047, 2047);
            command.roll =
                constrain((applyDeadzone(roll, 0.1)) * 4095 / 2, -2047, 2047);
            command.yaw =
                constrain(-(applyDeadzone(yaw, 0.1)) * 4095 / 2, -2047, 2047);

            var aux_mask = {};
            // aux1_low, aux1_mid, aux1_high, and same with aux2
            aux_mask['aux1_' + auxNames[aux1]] = true;
            aux_mask['aux2_' + auxNames[aux2]] = true;

            return serial.sendStructure('Command', {
                request_response: true,
                set_serial_rc: {
                    enabled: true,
                    command: command,
                    aux_mask: aux_mask,
                },
            }, false);
        }

        function setThrottle(v) {
            throttle = v;
        }

        function setPitch(v) {
            pitch = v;
        }

        function setRoll(v) {
            roll = v;
        }

        function setYaw(v) {
            yaw = v;
        }

        function setAux1(v) {
            aux1 = Math.max(0, Math.min(2, v));
        }

        function setAux2(v) {
            aux2 = Math.max(0, Math.min(2, v));
        }

        function getThrottle() {
            return throttle;
        }

        function getPitch() {
            return pitch;
        }

        function getRoll() {
            return roll;
        }

        function getYaw() {
            return yaw;
        }

        function getAux1() {
            return aux1;
        }

        function getAux2() {
            return aux2;
        }

        function forceNextSend() {
            urgent = true;
        }

        function constrain(x, xmin, xmax) {
            return Math.max(xmin, Math.min(x, xmax));
        }

        function applyDeadzone(value, deadzone) {
            if (value > deadzone) {
                return value - deadzone;
            }
            if (value < -deadzone) {
                return value + deadzone;
            }
            return 0;
        }
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('serial', serial);

    serial.$inject = ['$timeout', '$q', 'cobs', 'commandLog', 'firmwareVersion', 'serializationHandler'];

    function serial($timeout, $q, cobs, commandLog, firmwareVersion, serializationHandler) {
        var MessageType = {
            State: 0,
            Command: 1,
            DebugString: 3,
            HistoryData: 4,
            Protocol: 128,
            Response: 255,
        };

        var acknowledges = [];
        var backend = new Backend();

        var onReceiveListeners = [];

        var cobsReader = new cobs.Reader(10000);
        var bytesHandler = undefined;

        function Backend() {
        }

        Backend.prototype.busy = function() {
            return false;
        };

        Backend.prototype.send = function(data) {
            commandLog('No "send" defined for serial backend');
        };

        Backend.prototype.onRead = function(data) {
            commandLog('No "onRead" defined for serial backend');
        };

        var MessageTypeInversion = [];
        Object.keys(MessageType).forEach(function(key) {
            MessageTypeInversion[MessageType[key]] = key;
        });

        addOnReceiveCallback(function(messageType, message) {
            if (messageType === 'Response') {
                acknowledge(message.mask, message.ack);
            } else if (messageType === 'Protocol') {
                var data = message.response;
                if (data) {
                    serializationHandler.addHandler(data.version, data.structure);
                }
            }
        });

        return {
            busy: busy,
            sendStructure: sendStructure,
            setBackend: setBackend,
            addOnReceiveCallback: addOnReceiveCallback,
            removeOnReceiveCallback: removeOnReceiveCallback,
            setBytesHandler: setBytesHandler,
            handlePostConnect: handlePostConnect,
            Backend: Backend,
        };

        function setBackend(v) {
            backend = v;
            backend.onRead = read;
        }

        function handlePostConnect() {
            return requestFirmwareVersion();
        }

        function requestFirmwareVersion() {
            return sendStructure('Command', {
                request_response: true,
                req_partial_eeprom_data: {
                    version: true,
                },
            });
        }

        function sendStructure(messageType, data, log_send, extraMask) {
            if (messageType === 'State') {
                data = processStateOutput(data);
            }
            var handlers = firmwareVersion.serializationHandler();

            var response = $q.defer();
            if (!(messageType in MessageType)) {
                response.reject('Message type "' + messageType +
                    '" not supported by app, supported message types are:' +
                    Object.keys(MessageType).join(', '));
                return response.promise;
            }
            if (!(messageType in handlers)) {
                response.reject('Message type "' + messageType +
                    '" not supported by firmware, supported message types are:' +
                    Object.keys(handlers).join(', '));
                return response.promise;
            }
            var typeCode = MessageType[messageType];
            var handler = handlers[messageType];

            var buffer = new Uint8Array(handler.byteCount);

            var serializer = new serializationHandler.Serializer(new DataView(buffer.buffer));
            handler.encode(serializer, data, extraMask);
            var mask = handler.maskArray(data, extraMask);
            if (mask.length < 5) {
                mask = (mask[0] << 0) | (mask[1] << 8) | (mask[2] << 16) | (mask[3] << 24);
            }

            var dataLength = serializer.index;

            var output = new Uint8Array(dataLength + 3);
            output[0] = output[1] = typeCode;
            for (var idx = 0; idx < dataLength; ++idx) {
                output[0] ^= output[idx + 2] = buffer[idx];
            }
            output[dataLength + 2] = 0;

            acknowledges.push({
                mask: mask,
                response: response,
            });

            $timeout(function() {
                backend.send(new Uint8Array(cobs.encode(output)));
            }, 0);

            if (log_send) {
                commandLog('Sending command ' + typeCode);
            }

            return response.promise;
        }

        function busy() {
            return backend.busy();
        }

        function setBytesHandler(handler) {
            bytesHandler = handler;
        }

        function read(data) {
            if (bytesHandler)
                bytesHandler(data, processData);
            else
                cobsReader.readBytes(data, processData, reportIssues);
        }

        function reportIssues(issue, text) {
            commandLog('COBS decoding failed (' + issue + '): ' + text);
        }

        function addOnReceiveCallback(callback) {
            onReceiveListeners = onReceiveListeners.concat([callback]);
        }

        function removeOnReceiveCallback(callback) {
            onReceiveListeners = onReceiveListeners.filter(function(cb) {
                return cb !== callback;
            });
        }

        function acknowledge(mask, value) {
            while (acknowledges.length > 0) {
                var v = acknowledges.shift();
                if (v.mask ^ mask) {
                    v.response.reject('Missing ACK');
                    continue;
                }
                var relaxedMask = mask;
                relaxedMask &= ~1;
                if (relaxedMask ^ value) {
                    v.response.reject('Request was not fully processed');
                    break;
                }
                v.response.resolve();
                break;
            }
        }

        function processData(bytes) {
            var messageType = MessageTypeInversion[bytes[0]];
            var handler = firmwareVersion.serializationHandler()[messageType];
            if (!messageType || !handler) {
                commandLog('Illegal message type passed from firmware');
                return;
            }
            try {
                var serializer = new serializationHandler.Serializer(new DataView(bytes.buffer, 1));
                var message = handler.decode(serializer);
            } catch (err) {
                commandLog('Unrecognized message format received');
            }
            if (messageType === 'State') {
                message = processStateInput(message);
            }
            onReceiveListeners.forEach(function(listener) {
                listener(messageType, message);
            });
        }

        var last_timestamp_us = 0;

        function processStateInput(state) {
            state = Object.assign({}, state);
            var serial_update_rate_Hz = 0;

            if ('timestamp_us' in state) {
                state.serial_update_rate_estimate = 1000000 / (state.timestamp_us - last_timestamp_us);
                last_timestamp_us = state.timestamp_us;
            }
            if ('temperature' in state) {
                state.temperature /= 100.0;  // temperature given in Celsius * 100
            }
            if ('pressure' in state) {
                state.pressure /= 256.0;  // pressure given in (Q24.8) format
            }

            return state;
        }

        function processStateOutput(state) {
            state = Object.assign({}, state);
            if ('temperature' in state) {
                state.temperature *= 100.0;
            }
            if ('pressure' in state) {
                state.pressure *= 256.0;
            }
            return state;
        }
    }
}());

(function () {
    'use strict';

    serializationHandler.$inject = ['descriptorsHandler', 'deviceConfigParser'];

    angular.module('flybrixCommon').factory('serializationHandler', serializationHandler);

    function serializationHandler(descriptorsHandler, deviceConfigParser) {
        var handlerCache = {};
        var defaultsCache = {};

        var newestVersion = { major: 0, minor: 0, patch: 0 };

        function isNewerVersion(version) {
            if (version.major !== newestVersion.major) {
                return version.major > newestVersion.major;
            }
            if (version.minor !== newestVersion.minor) {
                return version.minor > newestVersion.minor;
            }
            return version.patch > newestVersion.patch;
        }

        function versionToString(version) {
            return version.major.toString() + '.' + version.minor.toString() + '.' + version.patch.toString();
        }

        function stringToVersion(version) {
            var parts = version.split('.');
            return {
                major: parseInt(parts[0]),
                minor: parseInt(parts[1]),
                patch: parseInt(parts[2]),
            };
        }

        function addHandler(version, structure, defaults) {
            if (isNewerVersion(version)) {
                newestVersion = {
                    major: version.major,
                    minor: version.minor,
                    patch: version.patch,
                };
            }
            var versionStr = versionToString(version);
            handlerCache[versionStr] = FlybrixSerialization.parse(structure);
            defaultsCache[versionStr] = deviceConfigParser.parse(defaults);
        }

        function copyHandler(version, srcVersion) {
            if (isNewerVersion(version)) {
                newestVersion = {
                    major: version.major,
                    minor: version.minor,
                    patch: version.patch,
                };
            }
            var versionStr = versionToString(version);
            var srcVersionStr = versionToString(srcVersion);
            handlerCache[versionStr] = handlerCache[srcVersionStr];
            defaultsCache[versionStr] = defaultsCache[srcVersionStr];
        }

        var descVersions = descriptorsHandler.versions;
        var descFiles = descriptorsHandler.files;
        var descReverseMap = {};
        Object.keys(descVersions).forEach(function(key) {
            var vers = stringToVersion(key);
            var filename = descVersions[key];
            if (filename in descReverseMap) {
                copyHandler(vers, descReverseMap[filename])
            } else {
                filename = descVersions[key];
                addHandler(vers, descFiles[filename], descFiles[filename + '.json']);
                descReverseMap[filename] = vers;
            }
        });

        function updateFields(target, source) {
            // Handle arrays
            if (source instanceof Array) {
                return updateFieldsArray(target, source);
            }
            // Handle objects
            if (source instanceof Object) {
                return updateFieldsObject(target, source);
            }
            // Handle bools, treating both false and missing fields as false
            if (target === true && !source) {
                return false;
            }
            // If new data is missing, use the old data
            if (source === null || source === undefined) {
                return target;
            }
            return source;
        }

        function updateFieldsObject(target, source) {
            var result = {};
            Object.keys(target).forEach(function (key) {
                result[key] = updateFields(target[key], source[key]);
            });
            Object.keys(source).forEach(function (key) {
                if (key in result) {
                    return;
                }
                result[key] = updateFields(target[key], source[key]);
            });
            return result;
        }

        function updateFieldsArray(target, source) {
            var length = Math.max(target.length, source.length);
            var result = [];
            for (var idx = 0; idx < length; ++idx) {
                result.push(updateFields(target[idx], source[idx]));
            }
            return result;
        }

        return {
            Serializer: FlybrixSerialization.Serializer,
            getDefaults: function (firmware) {
                return defaultsCache[firmware];
            },
            getHandler: function (firmware) {
                return handlerCache[firmware];
            },
            getNewestVersion: function () {
                return newestVersion;
            },
            addHandler: addHandler,
            copyHandler: copyHandler,
            updateFields: updateFields,
        };
    }

}());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImRlc2NyaXB0b3JzLmpzIiwiY2FsaWJyYXRpb24uanMiLCJjb2JzLmpzIiwiY29tbWFuZExvZy5qcyIsImRldmljZUNvbmZpZy5qcyIsImRldmljZUNvbmZpZ1BhcnNlci5qcyIsImZpcm13YXJlVmVyc2lvbi5qcyIsImxlZC5qcyIsInJjRGF0YS5qcyIsInNlcmlhbC5qcyIsInNlcmlhbGl6YXRpb25IYW5kbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDalBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZmx5YnJpeC1jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nLCBbXSk7XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGRlc2NyaXB0b3JzSGFuZGxlci4kaW5qZWN0ID0gW107XG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdkZXNjcmlwdG9yc0hhbmRsZXInLCBkZXNjcmlwdG9yc0hhbmRsZXIpO1xuICAgIGZ1bmN0aW9uIGRlc2NyaXB0b3JzSGFuZGxlcigpIHtcbiAgICAgICAgdmFyIHZlcnNpb25zID0ge1wiMS40LjBcIjpcIjEuNC50eHRcIixcIjEuNS4wXCI6XCIxLjUudHh0XCIsXCIxLjUuMVwiOlwiMS41LnR4dFwiLFwiMS42LjBcIjpcIjEuNi50eHRcIixcIjEuNy4wXCI6XCIxLjcudHh0XCJ9O1xuICAgICAgICB2YXIgZmlsZXMgPSB7XCIxLjQudHh0XCI6XCJWZWN0b3IzZj17eDpmMzIseTpmMzIsejpmMzJ9O1BJRFNldHRpbmdzPXtrcDpmMzIsa2k6ZjMyLGtkOmYzMixpbnRlZ3JhbF93aW5kdXBfZ3VhcmQ6ZjMyLGRfZmlsdGVyX3RpbWU6ZjMyLHNldHBvaW50X2ZpbHRlcl90aW1lOmYzMixjb21tYW5kX3RvX3ZhbHVlOmYzMn07VmVyc2lvbj17bWFqb3I6dTgsbWlub3I6dTgscGF0Y2g6dTh9O0NvbmZpZ0lEPXUzMjtQY2JUcmFuc2Zvcm09e29yaWVudGF0aW9uOlZlY3RvcjNmLHRyYW5zbGF0aW9uOlZlY3RvcjNmfTtNaXhUYWJsZT17Zno6W2k4OjhdLHR4OltpODo4XSx0eTpbaTg6OF0sdHo6W2k4OjhdfTtNYWdCaWFzPXtvZmZzZXQ6VmVjdG9yM2Z9O0NoYW5uZWxQcm9wZXJ0aWVzPXthc3NpZ25tZW50Ont0aHJ1c3Q6dTgscGl0Y2g6dTgscm9sbDp1OCx5YXc6dTgsYXV4MTp1OCxhdXgyOnU4fSxpbnZlcnNpb246ey84L3RocnVzdDp2b2lkLHBpdGNoOnZvaWQscm9sbDp2b2lkLHlhdzp2b2lkLGF1eDE6dm9pZCxhdXgyOnZvaWR9LG1pZHBvaW50Olt1MTY6Nl0sZGVhZHpvbmU6W3UxNjo2XX07UElEQnlwYXNzPXsvOC90aHJ1c3RfbWFzdGVyOnZvaWQscGl0Y2hfbWFzdGVyOnZvaWQscm9sbF9tYXN0ZXI6dm9pZCx5YXdfbWFzdGVyOnZvaWQsdGhydXN0X3NsYXZlOnZvaWQscGl0Y2hfc2xhdmU6dm9pZCxyb2xsX3NsYXZlOnZvaWQseWF3X3NsYXZlOnZvaWR9O1BJRFBhcmFtZXRlcnM9e3RocnVzdF9tYXN0ZXI6UElEU2V0dGluZ3MscGl0Y2hfbWFzdGVyOlBJRFNldHRpbmdzLHJvbGxfbWFzdGVyOlBJRFNldHRpbmdzLHlhd19tYXN0ZXI6UElEU2V0dGluZ3MsdGhydXN0X3NsYXZlOlBJRFNldHRpbmdzLHBpdGNoX3NsYXZlOlBJRFNldHRpbmdzLHJvbGxfc2xhdmU6UElEU2V0dGluZ3MseWF3X3NsYXZlOlBJRFNldHRpbmdzLHBpZF9ieXBhc3M6UElEQnlwYXNzfTtTdGF0ZVBhcmFtZXRlcnM9e3N0YXRlX2VzdGltYXRpb246W2YzMjoyXSxlbmFibGU6W2YzMjoyXX07U3RhdHVzRmxhZz17LzE2L2Jvb3Q6dm9pZCxtcHVfZmFpbDp2b2lkLGJtcF9mYWlsOnZvaWQscnhfZmFpbDp2b2lkLGlkbGU6dm9pZCxlbmFibGluZzp2b2lkLGNsZWFyX21wdV9iaWFzOnZvaWQsc2V0X21wdV9iaWFzOnZvaWQsZmFpbF9zdGFiaWxpdHk6dm9pZCxmYWlsX2FuZ2xlOnZvaWQsZW5hYmxlZDp2b2lkLGJhdHRlcnlfbG93OnZvaWQsdGVtcF93YXJuaW5nOnZvaWQsbG9nX2Z1bGw6dm9pZCxmYWlsX290aGVyOnZvaWQsb3ZlcnJpZGU6dm9pZH07Q29sb3I9e3JlZDp1OCxncmVlbjp1OCxibHVlOnU4fTtMRURTdGF0ZUNvbG9ycz17cmlnaHRfZnJvbnQ6Q29sb3IscmlnaHRfYmFjazpDb2xvcixsZWZ0X2Zyb250OkNvbG9yLGxlZnRfYmFjazpDb2xvcn07TEVEU3RhdGVDYXNlPXtzdGF0dXM6U3RhdHVzRmxhZyxwYXR0ZXJuOnU4LGNvbG9yczpMRURTdGF0ZUNvbG9ycyxpbmRpY2F0b3JfcmVkOmJvb2wsaW5kaWNhdG9yX2dyZWVuOmJvb2x9O0xFRFN0YXRlcz1bLzE2L0xFRFN0YXRlQ2FzZToxNl07TEVEU3RhdGVzRml4ZWQ9W0xFRFN0YXRlQ2FzZToxNl07RGV2aWNlTmFtZT1zOTtDb25maWd1cmF0aW9uPXsvMTYvdmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlcyxuYW1lOkRldmljZU5hbWV9O0NvbmZpZ3VyYXRpb25GaXhlZD17dmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlc0ZpeGVkLG5hbWU6RGV2aWNlTmFtZX07Q29uZmlndXJhdGlvbkZsYWc9ey8xNi92ZXJzaW9uOnZvaWQsaWQ6dm9pZCxwY2JfdHJhbnNmb3JtOnZvaWQsbWl4X3RhYmxlOnZvaWQsbWFnX2JpYXM6dm9pZCxjaGFubmVsOnZvaWQscGlkX3BhcmFtZXRlcnM6dm9pZCxzdGF0ZV9wYXJhbWV0ZXJzOnZvaWQsbGVkX3N0YXRlczpbLy92b2lkOjE2XSxuYW1lOnZvaWR9O1JvdGF0aW9uPXtwaXRjaDpmMzIscm9sbDpmMzIseWF3OmYzMn07UElEU3RhdGU9e3RpbWVzdGFtcF91czp1MzIsaW5wdXQ6ZjMyLHNldHBvaW50OmYzMixwX3Rlcm06ZjMyLGlfdGVybTpmMzIsZF90ZXJtOmYzMn07UmNDb21tYW5kPXt0aHJvdHRsZTppMTYscGl0Y2g6aTE2LHJvbGw6aTE2LHlhdzppMTZ9O1N0YXRlPXsvMzIvdGltZXN0YW1wX3VzOnUzMixzdGF0dXM6U3RhdHVzRmxhZyx2MF9yYXc6dTE2LGkwX3Jhdzp1MTYsaTFfcmF3OnUxNixhY2NlbDpWZWN0b3IzZixneXJvOlZlY3RvcjNmLG1hZzpWZWN0b3IzZix0ZW1wZXJhdHVyZTp1MTYscHJlc3N1cmU6dTMyLHBwbTpbaTE2OjZdLGF1eF9jaGFuX21hc2s6dTgsY29tbWFuZDpSY0NvbW1hbmQsY29udHJvbDp7Zno6ZjMyLHR4OmYzMix0eTpmMzIsdHo6ZjMyfSxwaWRfbWFzdGVyX2Z6OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHg6UElEU3RhdGUscGlkX21hc3Rlcl90eTpQSURTdGF0ZSxwaWRfbWFzdGVyX3R6OlBJRFN0YXRlLHBpZF9zbGF2ZV9mejpQSURTdGF0ZSxwaWRfc2xhdmVfdHg6UElEU3RhdGUscGlkX3NsYXZlX3R5OlBJRFN0YXRlLHBpZF9zbGF2ZV90ejpQSURTdGF0ZSxtb3Rvcl9vdXQ6W2kxNjo4XSxraW5lbWF0aWNzX2FuZ2xlOlJvdGF0aW9uLGtpbmVtYXRpY3NfcmF0ZTpSb3RhdGlvbixraW5lbWF0aWNzX2FsdGl0dWRlOmYzMixsb29wX2NvdW50OnUzMn07U3RhdGVGaWVsZHM9ey8zMi90aW1lc3RhbXBfdXM6dm9pZCxzdGF0dXM6dm9pZCx2MF9yYXc6dm9pZCxpMF9yYXc6dm9pZCxpMV9yYXc6dm9pZCxhY2NlbDp2b2lkLGd5cm86dm9pZCxtYWc6dm9pZCx0ZW1wZXJhdHVyZTp2b2lkLHByZXNzdXJlOnZvaWQscHBtOnZvaWQsYXV4X2NoYW5fbWFzazp2b2lkLGNvbW1hbmQ6dm9pZCxjb250cm9sOnZvaWQscGlkX21hc3Rlcl9mejp2b2lkLHBpZF9tYXN0ZXJfdHg6dm9pZCxwaWRfbWFzdGVyX3R5OnZvaWQscGlkX21hc3Rlcl90ejp2b2lkLHBpZF9zbGF2ZV9mejp2b2lkLHBpZF9zbGF2ZV90eDp2b2lkLHBpZF9zbGF2ZV90eTp2b2lkLHBpZF9zbGF2ZV90ejp2b2lkLG1vdG9yX291dDp2b2lkLGtpbmVtYXRpY3NfYW5nbGU6dm9pZCxraW5lbWF0aWNzX3JhdGU6dm9pZCxraW5lbWF0aWNzX2FsdGl0dWRlOnZvaWQsbG9vcF9jb3VudDp2b2lkfTtBdXhNYXNrPXsvL2F1eDFfbG93OnZvaWQsYXV4MV9taWQ6dm9pZCxhdXgxX2hpZ2g6dm9pZCxhdXgyX2xvdzp2b2lkLGF1eDJfbWlkOnZvaWQsYXV4Ml9oaWdoOnZvaWR9O0NvbW1hbmQ9ey8zMi9yZXF1ZXN0X3Jlc3BvbnNlOnZvaWQsc2V0X2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GaXhlZCxyZWluaXRfZWVwcm9tX2RhdGE6dm9pZCxyZXF1ZXN0X2VlcHJvbV9kYXRhOnZvaWQscmVxdWVzdF9lbmFibGVfaXRlcmF0aW9uOnU4LG1vdG9yX292ZXJyaWRlX3NwZWVkXzA6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzE6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzI6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzM6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzQ6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzU6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzY6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzc6dTE2LHNldF9jb21tYW5kX292ZXJyaWRlOmJvb2wsc2V0X3N0YXRlX21hc2s6U3RhdGVGaWVsZHMsc2V0X3N0YXRlX2RlbGF5OnUxNixzZXRfc2Rfd3JpdGVfZGVsYXk6dTE2LHNldF9sZWQ6e3BhdHRlcm46dTgsY29sb3JfcmlnaHQ6Q29sb3IsY29sb3JfbGVmdDpDb2xvcixpbmRpY2F0b3JfcmVkOmJvb2wsaW5kaWNhdG9yX2dyZWVuOmJvb2x9LHNldF9zZXJpYWxfcmM6e2VuYWJsZWQ6Ym9vbCxjb21tYW5kOlJjQ29tbWFuZCxhdXhfbWFzazpBdXhNYXNrfSxzZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGU6ey84L3JlY29yZF90b19jYXJkOnZvaWQsbG9ja19yZWNvcmRpbmdfc3RhdGU6dm9pZH0sc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbixyZWluaXRfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRmxhZyxyZXFfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRmxhZyxyZXFfY2FyZF9yZWNvcmRpbmdfc3RhdGU6dm9pZCxzZXRfcGFydGlhbF90ZW1wb3JhcnlfY29uZmlnOkNvbmZpZ3VyYXRpb24sc2V0X2NvbW1hbmRfc291cmNlczp7Lzgvc2VyaWFsOnZvaWQscmFkaW86dm9pZH0sc2V0X2NhbGlicmF0aW9uOntlbmFibGVkOmJvb2wsbW9kZTp1OH0sc2V0X2F1dG9waWxvdF9lbmFibGVkOmJvb2wsc2V0X3VzYl9tb2RlOnU4fTtEZWJ1Z1N0cmluZz17ZGVwcmVjYXRlZF9tYXNrOnUzMixtZXNzYWdlOnN9O0hpc3RvcnlEYXRhPURlYnVnU3RyaW5nO1Jlc3BvbnNlPXttYXNrOnUzMixhY2s6dTMyfTtcIixcIjEuNC50eHQuanNvblwiOlwie1xcXCJ2ZXJzaW9uXFxcIjp7XFxcIm1ham9yXFxcIjoxLFxcXCJtaW5vclxcXCI6NCxcXFwicGF0Y2hcXFwiOjB9LFxcXCJpZFxcXCI6MCxcXFwicGNiX3RyYW5zZm9ybVxcXCI6e1xcXCJvcmllbnRhdGlvblxcXCI6e1xcXCJ4XFxcIjowLFxcXCJ5XFxcIjowLFxcXCJ6XFxcIjowfSxcXFwidHJhbnNsYXRpb25cXFwiOntcXFwieFxcXCI6MCxcXFwieVxcXCI6MCxcXFwielxcXCI6MH19LFxcXCJtaXhfdGFibGVcXFwiOntcXFwiZnpcXFwiOlsxLDEsMSwxLDEsMSwxLDFdLFxcXCJ0eFxcXCI6WzEsMSwxLDEsLTEsLTEsLTEsLTFdLFxcXCJ0eVxcXCI6Wy0xLDEsLTEsMSwtMSwxLC0xLDFdLFxcXCJ0elxcXCI6WzEsLTEsLTEsMSwxLC0xLC0xLDFdfSxcXFwibWFnX2JpYXNcXFwiOntcXFwib2Zmc2V0XFxcIjp7XFxcInhcXFwiOjAsXFxcInlcXFwiOjAsXFxcInpcXFwiOjB9fSxcXFwiY2hhbm5lbFxcXCI6e1xcXCJhc3NpZ25tZW50XFxcIjp7XFxcInRocnVzdFxcXCI6MixcXFwicGl0Y2hcXFwiOjEsXFxcInJvbGxcXFwiOjAsXFxcInlhd1xcXCI6MyxcXFwiYXV4MVxcXCI6NCxcXFwiYXV4MlxcXCI6NX0sXFxcImludmVyc2lvblxcXCI6e1xcXCJ0aHJ1c3RcXFwiOm51bGwsXFxcInBpdGNoXFxcIjp0cnVlLFxcXCJyb2xsXFxcIjp0cnVlLFxcXCJ5YXdcXFwiOm51bGwsXFxcImF1eDFcXFwiOm51bGwsXFxcImF1eDJcXFwiOm51bGx9LFxcXCJtaWRwb2ludFxcXCI6WzE1MDAsMTUwMCwxNTAwLDE1MDAsMTUwMCwxNTAwXSxcXFwiZGVhZHpvbmVcXFwiOlswLDAsMCwyMCwwLDBdfSxcXFwicGlkX3BhcmFtZXRlcnNcXFwiOntcXFwidGhydXN0X21hc3RlclxcXCI6e1xcXCJrcFxcXCI6MS4wLFxcXCJraVxcXCI6MC4wLFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MS4wfSxcXFwicGl0Y2hfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjozLjUsXFxcImtpXFxcIjowLjUsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAwLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjMwLjB9LFxcXCJyb2xsX21hc3RlclxcXCI6e1xcXCJrcFxcXCI6My41LFxcXCJraVxcXCI6MC41LFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjMwMC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjozMC4wfSxcXFwieWF3X21hc3RlclxcXCI6e1xcXCJrcFxcXCI6MS4wLFxcXCJraVxcXCI6MC4wLFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MTgwLjB9LFxcXCJ0aHJ1c3Rfc2xhdmVcXFwiOntcXFwia3BcXFwiOjEuMCxcXFwia2lcXFwiOjAuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjowLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjEuMH0sXFxcInBpdGNoX3NsYXZlXFxcIjp7XFxcImtwXFxcIjo1LjAsXFxcImtpXFxcIjoyLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAwLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjE1MC4wfSxcXFwicm9sbF9zbGF2ZVxcXCI6e1xcXCJrcFxcXCI6NS4wLFxcXCJraVxcXCI6Mi4wLFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjMwMC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxNTAuMH0sXFxcInlhd19zbGF2ZVxcXCI6e1xcXCJrcFxcXCI6NDAuMCxcXFwia2lcXFwiOjEwLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAwLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjI0MC4wfSxcXFwicGlkX2J5cGFzc1xcXCI6e1xcXCJ0aHJ1c3RfbWFzdGVyXFxcIjp0cnVlLFxcXCJwaXRjaF9tYXN0ZXJcXFwiOm51bGwsXFxcInJvbGxfbWFzdGVyXFxcIjpudWxsLFxcXCJ5YXdfbWFzdGVyXFxcIjp0cnVlLFxcXCJ0aHJ1c3Rfc2xhdmVcXFwiOnRydWUsXFxcInBpdGNoX3NsYXZlXFxcIjpudWxsLFxcXCJyb2xsX3NsYXZlXFxcIjpudWxsLFxcXCJ5YXdfc2xhdmVcXFwiOm51bGx9fSxcXFwic3RhdGVfcGFyYW1ldGVyc1xcXCI6e1xcXCJzdGF0ZV9lc3RpbWF0aW9uXFxcIjpbMSwwLjAxXSxcXFwiZW5hYmxlXFxcIjpbMC4wMDEsMzBdfSxcXFwibGVkX3N0YXRlc1xcXCI6W3tcXFwic3RhdHVzXFxcIjp7XFxcImNyYXNoX2RldGVjdGVkXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9mbGFzaH1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX09yYW5nZX1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwibG9vcF9zbG93XFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9zb2xpZH1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX1JlZH1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwib3ZlcnJpZGVcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX3NvbGlkfVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfTGlnaHRTZWFHcmVlbn1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwibG9nX2Z1bGxcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX2ZsYXNofVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfT3JhbmdlfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJub19zaWduYWxcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX2ZsYXNofVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfR3JlZW59XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LHtcXFwic3RhdHVzXFxcIjp7XFxcImFybWluZ1xcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fZmxhc2h9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9CbHVlfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJhcm1lZFxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fYmVhY29ufVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfQmx1ZX1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwiaWRsZVxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fYnJlYXRoZX1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX0dyZWVufVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSxcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIl0sXFxcIm5hbWVcXFwiOlxcXCJGTFlCUklYXFxcIn1cIixcIjEuNS50eHRcIjpcIlZlY3RvcjNmPXt4OmYzMix5OmYzMix6OmYzMn07UElEU2V0dGluZ3M9e2twOmYzMixraTpmMzIsa2Q6ZjMyLGludGVncmFsX3dpbmR1cF9ndWFyZDpmMzIsZF9maWx0ZXJfdGltZTpmMzIsc2V0cG9pbnRfZmlsdGVyX3RpbWU6ZjMyLGNvbW1hbmRfdG9fdmFsdWU6ZjMyfTtWZXJzaW9uPXttYWpvcjp1OCxtaW5vcjp1OCxwYXRjaDp1OH07Q29uZmlnSUQ9dTMyO1BjYlRyYW5zZm9ybT17b3JpZW50YXRpb246VmVjdG9yM2YsdHJhbnNsYXRpb246VmVjdG9yM2Z9O01peFRhYmxlPXtmejpbaTg6OF0sdHg6W2k4OjhdLHR5OltpODo4XSx0ejpbaTg6OF19O01hZ0JpYXM9e29mZnNldDpWZWN0b3IzZn07Q2hhbm5lbFByb3BlcnRpZXM9e2Fzc2lnbm1lbnQ6e3RocnVzdDp1OCxwaXRjaDp1OCxyb2xsOnU4LHlhdzp1OCxhdXgxOnU4LGF1eDI6dTh9LGludmVyc2lvbjp7LzgvdGhydXN0OnZvaWQscGl0Y2g6dm9pZCxyb2xsOnZvaWQseWF3OnZvaWQsYXV4MTp2b2lkLGF1eDI6dm9pZH0sbWlkcG9pbnQ6W3UxNjo2XSxkZWFkem9uZTpbdTE2OjZdfTtQSURCeXBhc3M9ey84L3RocnVzdF9tYXN0ZXI6dm9pZCxwaXRjaF9tYXN0ZXI6dm9pZCxyb2xsX21hc3Rlcjp2b2lkLHlhd19tYXN0ZXI6dm9pZCx0aHJ1c3Rfc2xhdmU6dm9pZCxwaXRjaF9zbGF2ZTp2b2lkLHJvbGxfc2xhdmU6dm9pZCx5YXdfc2xhdmU6dm9pZH07UElEUGFyYW1ldGVycz17dGhydXN0X21hc3RlcjpQSURTZXR0aW5ncyxwaXRjaF9tYXN0ZXI6UElEU2V0dGluZ3Mscm9sbF9tYXN0ZXI6UElEU2V0dGluZ3MseWF3X21hc3RlcjpQSURTZXR0aW5ncyx0aHJ1c3Rfc2xhdmU6UElEU2V0dGluZ3MscGl0Y2hfc2xhdmU6UElEU2V0dGluZ3Mscm9sbF9zbGF2ZTpQSURTZXR0aW5ncyx5YXdfc2xhdmU6UElEU2V0dGluZ3MsdGhydXN0X2dhaW46ZjMyLHBpdGNoX2dhaW46ZjMyLHJvbGxfZ2FpbjpmMzIseWF3X2dhaW46ZjMyLHBpZF9ieXBhc3M6UElEQnlwYXNzfTtTdGF0ZVBhcmFtZXRlcnM9e3N0YXRlX2VzdGltYXRpb246W2YzMjoyXSxlbmFibGU6W2YzMjoyXX07U3RhdHVzRmxhZz17LzE2L2Jvb3Q6dm9pZCxtcHVfZmFpbDp2b2lkLGJtcF9mYWlsOnZvaWQscnhfZmFpbDp2b2lkLGlkbGU6dm9pZCxlbmFibGluZzp2b2lkLGNsZWFyX21wdV9iaWFzOnZvaWQsc2V0X21wdV9iaWFzOnZvaWQsZmFpbF9zdGFiaWxpdHk6dm9pZCxmYWlsX2FuZ2xlOnZvaWQsZW5hYmxlZDp2b2lkLGJhdHRlcnlfbG93OnZvaWQsdGVtcF93YXJuaW5nOnZvaWQsbG9nX2Z1bGw6dm9pZCxmYWlsX290aGVyOnZvaWQsb3ZlcnJpZGU6dm9pZH07Q29sb3I9e3JlZDp1OCxncmVlbjp1OCxibHVlOnU4fTtMRURTdGF0ZUNvbG9ycz17cmlnaHRfZnJvbnQ6Q29sb3IscmlnaHRfYmFjazpDb2xvcixsZWZ0X2Zyb250OkNvbG9yLGxlZnRfYmFjazpDb2xvcn07TEVEU3RhdGVDYXNlPXtzdGF0dXM6U3RhdHVzRmxhZyxwYXR0ZXJuOnU4LGNvbG9yczpMRURTdGF0ZUNvbG9ycyxpbmRpY2F0b3JfcmVkOmJvb2wsaW5kaWNhdG9yX2dyZWVuOmJvb2x9O0xFRFN0YXRlcz1bLzE2L0xFRFN0YXRlQ2FzZToxNl07TEVEU3RhdGVzRml4ZWQ9W0xFRFN0YXRlQ2FzZToxNl07RGV2aWNlTmFtZT1zOTtDb25maWd1cmF0aW9uPXsvMTYvdmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlcyxuYW1lOkRldmljZU5hbWV9O0NvbmZpZ3VyYXRpb25GaXhlZD17dmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlc0ZpeGVkLG5hbWU6RGV2aWNlTmFtZX07Q29uZmlndXJhdGlvbkZsYWc9ey8xNi92ZXJzaW9uOnZvaWQsaWQ6dm9pZCxwY2JfdHJhbnNmb3JtOnZvaWQsbWl4X3RhYmxlOnZvaWQsbWFnX2JpYXM6dm9pZCxjaGFubmVsOnZvaWQscGlkX3BhcmFtZXRlcnM6dm9pZCxzdGF0ZV9wYXJhbWV0ZXJzOnZvaWQsbGVkX3N0YXRlczpbLy92b2lkOjE2XSxuYW1lOnZvaWQsdmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6dm9pZCxpbmVydGlhbF9iaWFzOnZvaWR9O1JvdGF0aW9uPXtwaXRjaDpmMzIscm9sbDpmMzIseWF3OmYzMn07UElEU3RhdGU9e3RpbWVzdGFtcF91czp1MzIsaW5wdXQ6ZjMyLHNldHBvaW50OmYzMixwX3Rlcm06ZjMyLGlfdGVybTpmMzIsZF90ZXJtOmYzMn07UmNDb21tYW5kPXt0aHJvdHRsZTppMTYscGl0Y2g6aTE2LHJvbGw6aTE2LHlhdzppMTZ9O1N0YXRlPXsvMzIvdGltZXN0YW1wX3VzOnUzMixzdGF0dXM6U3RhdHVzRmxhZyx2MF9yYXc6dTE2LGkwX3Jhdzp1MTYsaTFfcmF3OnUxNixhY2NlbDpWZWN0b3IzZixneXJvOlZlY3RvcjNmLG1hZzpWZWN0b3IzZix0ZW1wZXJhdHVyZTp1MTYscHJlc3N1cmU6dTMyLHBwbTpbaTE2OjZdLGF1eF9jaGFuX21hc2s6dTgsY29tbWFuZDpSY0NvbW1hbmQsY29udHJvbDp7Zno6ZjMyLHR4OmYzMix0eTpmMzIsdHo6ZjMyfSxwaWRfbWFzdGVyX2Z6OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHg6UElEU3RhdGUscGlkX21hc3Rlcl90eTpQSURTdGF0ZSxwaWRfbWFzdGVyX3R6OlBJRFN0YXRlLHBpZF9zbGF2ZV9mejpQSURTdGF0ZSxwaWRfc2xhdmVfdHg6UElEU3RhdGUscGlkX3NsYXZlX3R5OlBJRFN0YXRlLHBpZF9zbGF2ZV90ejpQSURTdGF0ZSxtb3Rvcl9vdXQ6W2kxNjo4XSxraW5lbWF0aWNzX2FuZ2xlOlJvdGF0aW9uLGtpbmVtYXRpY3NfcmF0ZTpSb3RhdGlvbixraW5lbWF0aWNzX2FsdGl0dWRlOmYzMixsb29wX2NvdW50OnUzMn07U3RhdGVGaWVsZHM9ey8zMi90aW1lc3RhbXBfdXM6dm9pZCxzdGF0dXM6dm9pZCx2MF9yYXc6dm9pZCxpMF9yYXc6dm9pZCxpMV9yYXc6dm9pZCxhY2NlbDp2b2lkLGd5cm86dm9pZCxtYWc6dm9pZCx0ZW1wZXJhdHVyZTp2b2lkLHByZXNzdXJlOnZvaWQscHBtOnZvaWQsYXV4X2NoYW5fbWFzazp2b2lkLGNvbW1hbmQ6dm9pZCxjb250cm9sOnZvaWQscGlkX21hc3Rlcl9mejp2b2lkLHBpZF9tYXN0ZXJfdHg6dm9pZCxwaWRfbWFzdGVyX3R5OnZvaWQscGlkX21hc3Rlcl90ejp2b2lkLHBpZF9zbGF2ZV9mejp2b2lkLHBpZF9zbGF2ZV90eDp2b2lkLHBpZF9zbGF2ZV90eTp2b2lkLHBpZF9zbGF2ZV90ejp2b2lkLG1vdG9yX291dDp2b2lkLGtpbmVtYXRpY3NfYW5nbGU6dm9pZCxraW5lbWF0aWNzX3JhdGU6dm9pZCxraW5lbWF0aWNzX2FsdGl0dWRlOnZvaWQsbG9vcF9jb3VudDp2b2lkfTtBdXhNYXNrPXsvL2F1eDFfbG93OnZvaWQsYXV4MV9taWQ6dm9pZCxhdXgxX2hpZ2g6dm9pZCxhdXgyX2xvdzp2b2lkLGF1eDJfbWlkOnZvaWQsYXV4Ml9oaWdoOnZvaWR9O0NvbW1hbmQ9ey8zMi9yZXF1ZXN0X3Jlc3BvbnNlOnZvaWQsc2V0X2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GaXhlZCxyZWluaXRfZWVwcm9tX2RhdGE6dm9pZCxyZXF1ZXN0X2VlcHJvbV9kYXRhOnZvaWQscmVxdWVzdF9lbmFibGVfaXRlcmF0aW9uOnU4LG1vdG9yX292ZXJyaWRlX3NwZWVkXzA6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzE6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzI6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzM6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzQ6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzU6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzY6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzc6dTE2LHNldF9jb21tYW5kX292ZXJyaWRlOmJvb2wsc2V0X3N0YXRlX21hc2s6U3RhdGVGaWVsZHMsc2V0X3N0YXRlX2RlbGF5OnUxNixzZXRfc2Rfd3JpdGVfZGVsYXk6dTE2LHNldF9sZWQ6e3BhdHRlcm46dTgsY29sb3JfcmlnaHQ6Q29sb3IsY29sb3JfbGVmdDpDb2xvcixpbmRpY2F0b3JfcmVkOmJvb2wsaW5kaWNhdG9yX2dyZWVuOmJvb2x9LHNldF9zZXJpYWxfcmM6e2VuYWJsZWQ6Ym9vbCxjb21tYW5kOlJjQ29tbWFuZCxhdXhfbWFzazpBdXhNYXNrfSxzZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGU6ey84L3JlY29yZF90b19jYXJkOnZvaWQsbG9ja19yZWNvcmRpbmdfc3RhdGU6dm9pZH0sc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbixyZWluaXRfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRmxhZyxyZXFfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRmxhZyxyZXFfY2FyZF9yZWNvcmRpbmdfc3RhdGU6dm9pZCxzZXRfcGFydGlhbF90ZW1wb3JhcnlfY29uZmlnOkNvbmZpZ3VyYXRpb24sc2V0X2NvbW1hbmRfc291cmNlczp7Lzgvc2VyaWFsOnZvaWQscmFkaW86dm9pZH0sc2V0X2NhbGlicmF0aW9uOntlbmFibGVkOmJvb2wsbW9kZTp1OH0sc2V0X2F1dG9waWxvdF9lbmFibGVkOmJvb2wsc2V0X3VzYl9tb2RlOnU4fTtEZWJ1Z1N0cmluZz17ZGVwcmVjYXRlZF9tYXNrOnUzMixtZXNzYWdlOnN9O0hpc3RvcnlEYXRhPURlYnVnU3RyaW5nO1Jlc3BvbnNlPXttYXNrOnUzMixhY2s6dTMyfTtcIixcIjEuNS50eHQuanNvblwiOlwie1xcXCJ2ZXJzaW9uXFxcIjp7XFxcIm1ham9yXFxcIjoxLFxcXCJtaW5vclxcXCI6NSxcXFwicGF0Y2hcXFwiOjB9LFxcXCJpZFxcXCI6MCxcXFwicGNiX3RyYW5zZm9ybVxcXCI6e1xcXCJvcmllbnRhdGlvblxcXCI6e1xcXCJ4XFxcIjowLFxcXCJ5XFxcIjowLFxcXCJ6XFxcIjowfSxcXFwidHJhbnNsYXRpb25cXFwiOntcXFwieFxcXCI6MCxcXFwieVxcXCI6MCxcXFwielxcXCI6MH19LFxcXCJtaXhfdGFibGVcXFwiOntcXFwiZnpcXFwiOlsxLDEsMSwxLDEsMSwxLDFdLFxcXCJ0eFxcXCI6WzEsMSwxLDEsLTEsLTEsLTEsLTFdLFxcXCJ0eVxcXCI6Wy0xLDEsLTEsMSwtMSwxLC0xLDFdLFxcXCJ0elxcXCI6WzEsLTEsLTEsMSwxLC0xLC0xLDFdfSxcXFwibWFnX2JpYXNcXFwiOntcXFwib2Zmc2V0XFxcIjp7XFxcInhcXFwiOjAsXFxcInlcXFwiOjAsXFxcInpcXFwiOjB9fSxcXFwiY2hhbm5lbFxcXCI6e1xcXCJhc3NpZ25tZW50XFxcIjp7XFxcInRocnVzdFxcXCI6MixcXFwicGl0Y2hcXFwiOjEsXFxcInJvbGxcXFwiOjAsXFxcInlhd1xcXCI6MyxcXFwiYXV4MVxcXCI6NCxcXFwiYXV4MlxcXCI6NX0sXFxcImludmVyc2lvblxcXCI6e1xcXCJ0aHJ1c3RcXFwiOm51bGwsXFxcInBpdGNoXFxcIjp0cnVlLFxcXCJyb2xsXFxcIjp0cnVlLFxcXCJ5YXdcXFwiOm51bGwsXFxcImF1eDFcXFwiOm51bGwsXFxcImF1eDJcXFwiOm51bGx9LFxcXCJtaWRwb2ludFxcXCI6WzE1MDAsMTUwMCwxNTAwLDE1MDAsMTUwMCwxNTAwXSxcXFwiZGVhZHpvbmVcXFwiOlswLDAsMCwyMCwwLDBdfSxcXFwicGlkX3BhcmFtZXRlcnNcXFwiOntcXFwidGhydXN0X21hc3RlclxcXCI6e1xcXCJrcFxcXCI6MS4wLFxcXCJraVxcXCI6MC4wLFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MS4wfSxcXFwicGl0Y2hfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjozLjUsXFxcImtpXFxcIjowLjUsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAwLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjMwLjB9LFxcXCJyb2xsX21hc3RlclxcXCI6e1xcXCJrcFxcXCI6My41LFxcXCJraVxcXCI6MC41LFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjMwMC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjozMC4wfSxcXFwieWF3X21hc3RlclxcXCI6e1xcXCJrcFxcXCI6MS4wLFxcXCJraVxcXCI6MC4wLFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MTgwLjB9LFxcXCJ0aHJ1c3Rfc2xhdmVcXFwiOntcXFwia3BcXFwiOjEuMCxcXFwia2lcXFwiOjAuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjowLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjEuMH0sXFxcInBpdGNoX3NsYXZlXFxcIjp7XFxcImtwXFxcIjo1LjAsXFxcImtpXFxcIjoyLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAwLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjE1MC4wfSxcXFwicm9sbF9zbGF2ZVxcXCI6e1xcXCJrcFxcXCI6NS4wLFxcXCJraVxcXCI6Mi4wLFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjMwMC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxNTAuMH0sXFxcInlhd19zbGF2ZVxcXCI6e1xcXCJrcFxcXCI6NDAuMCxcXFwia2lcXFwiOjEwLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAwLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjI0MC4wfSxcXFwidGhydXN0X2dhaW5cXFwiOjQwOTUsXFxcInBpdGNoX2dhaW5cXFwiOjIwNDcsXFxcInJvbGxfZ2FpblxcXCI6MjA0NyxcXFwieWF3X2dhaW5cXFwiOjIwNDcsXFxcInBpZF9ieXBhc3NcXFwiOntcXFwidGhydXN0X21hc3RlclxcXCI6dHJ1ZSxcXFwicGl0Y2hfbWFzdGVyXFxcIjpudWxsLFxcXCJyb2xsX21hc3RlclxcXCI6bnVsbCxcXFwieWF3X21hc3RlclxcXCI6dHJ1ZSxcXFwidGhydXN0X3NsYXZlXFxcIjp0cnVlLFxcXCJwaXRjaF9zbGF2ZVxcXCI6bnVsbCxcXFwicm9sbF9zbGF2ZVxcXCI6bnVsbCxcXFwieWF3X3NsYXZlXFxcIjpudWxsfX0sXFxcInN0YXRlX3BhcmFtZXRlcnNcXFwiOntcXFwic3RhdGVfZXN0aW1hdGlvblxcXCI6WzEsMC4wMV0sXFxcImVuYWJsZVxcXCI6WzAuMDAxLDMwXX0sXFxcImxlZF9zdGF0ZXNcXFwiOlt7XFxcInN0YXR1c1xcXCI6e1xcXCJjcmFzaF9kZXRlY3RlZFxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fZmxhc2h9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9PcmFuZ2V9XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LHtcXFwic3RhdHVzXFxcIjp7XFxcImxvb3Bfc2xvd1xcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fc29saWR9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9SZWR9XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LHtcXFwic3RhdHVzXFxcIjp7XFxcIm92ZXJyaWRlXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9zb2xpZH1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX0xpZ2h0U2VhR3JlZW59XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LHtcXFwic3RhdHVzXFxcIjp7XFxcImxvZ19mdWxsXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9mbGFzaH1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX09yYW5nZX1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwibm9fc2lnbmFsXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9mbGFzaH1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX0dyZWVufVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJhcm1pbmdcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX2ZsYXNofVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfQmx1ZX1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwiYXJtZWRcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX2JlYWNvbn1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX0JsdWV9XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LHtcXFwic3RhdHVzXFxcIjp7XFxcImlkbGVcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX2JyZWF0aGV9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9HcmVlbn1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0sXFxcIiR7TEVEX3VudXNlZF9tb2RlfVxcXCIsXFxcIiR7TEVEX3VudXNlZF9tb2RlfVxcXCIsXFxcIiR7TEVEX3VudXNlZF9tb2RlfVxcXCIsXFxcIiR7TEVEX3VudXNlZF9tb2RlfVxcXCIsXFxcIiR7TEVEX3VudXNlZF9tb2RlfVxcXCIsXFxcIiR7TEVEX3VudXNlZF9tb2RlfVxcXCIsXFxcIiR7TEVEX3VudXNlZF9tb2RlfVxcXCIsXFxcIiR7TEVEX3VudXNlZF9tb2RlfVxcXCJdLFxcXCJuYW1lXFxcIjpcXFwiRkxZQlJJWFxcXCJ9XCIsXCIxLjYudHh0XCI6XCJWZWN0b3IzZj17eDpmMzIseTpmMzIsejpmMzJ9O1BJRFNldHRpbmdzPXtrcDpmMzIsa2k6ZjMyLGtkOmYzMixpbnRlZ3JhbF93aW5kdXBfZ3VhcmQ6ZjMyLGRfZmlsdGVyX3RpbWU6ZjMyLHNldHBvaW50X2ZpbHRlcl90aW1lOmYzMixjb21tYW5kX3RvX3ZhbHVlOmYzMn07VmVyc2lvbj17bWFqb3I6dTgsbWlub3I6dTgscGF0Y2g6dTh9O0NvbmZpZ0lEPXUzMjtQY2JUcmFuc2Zvcm09e29yaWVudGF0aW9uOlZlY3RvcjNmLHRyYW5zbGF0aW9uOlZlY3RvcjNmfTtNaXhUYWJsZT17Zno6W2k4OjhdLHR4OltpODo4XSx0eTpbaTg6OF0sdHo6W2k4OjhdfTtNYWdCaWFzPXtvZmZzZXQ6VmVjdG9yM2Z9O0NoYW5uZWxQcm9wZXJ0aWVzPXthc3NpZ25tZW50Ont0aHJ1c3Q6dTgscGl0Y2g6dTgscm9sbDp1OCx5YXc6dTgsYXV4MTp1OCxhdXgyOnU4fSxpbnZlcnNpb246ey84L3RocnVzdDp2b2lkLHBpdGNoOnZvaWQscm9sbDp2b2lkLHlhdzp2b2lkLGF1eDE6dm9pZCxhdXgyOnZvaWR9LG1pZHBvaW50Olt1MTY6Nl0sZGVhZHpvbmU6W3UxNjo2XX07UElEQnlwYXNzPXsvOC90aHJ1c3RfbWFzdGVyOnZvaWQscGl0Y2hfbWFzdGVyOnZvaWQscm9sbF9tYXN0ZXI6dm9pZCx5YXdfbWFzdGVyOnZvaWQsdGhydXN0X3NsYXZlOnZvaWQscGl0Y2hfc2xhdmU6dm9pZCxyb2xsX3NsYXZlOnZvaWQseWF3X3NsYXZlOnZvaWR9O1BJRFBhcmFtZXRlcnM9e3RocnVzdF9tYXN0ZXI6UElEU2V0dGluZ3MscGl0Y2hfbWFzdGVyOlBJRFNldHRpbmdzLHJvbGxfbWFzdGVyOlBJRFNldHRpbmdzLHlhd19tYXN0ZXI6UElEU2V0dGluZ3MsdGhydXN0X3NsYXZlOlBJRFNldHRpbmdzLHBpdGNoX3NsYXZlOlBJRFNldHRpbmdzLHJvbGxfc2xhdmU6UElEU2V0dGluZ3MseWF3X3NsYXZlOlBJRFNldHRpbmdzLHRocnVzdF9nYWluOmYzMixwaXRjaF9nYWluOmYzMixyb2xsX2dhaW46ZjMyLHlhd19nYWluOmYzMixwaWRfYnlwYXNzOlBJREJ5cGFzc307U3RhdGVQYXJhbWV0ZXJzPXtzdGF0ZV9lc3RpbWF0aW9uOltmMzI6Ml0sZW5hYmxlOltmMzI6Ml19O1N0YXR1c0ZsYWc9ey8xNi9fMDp2b2lkLF8xOnZvaWQsXzI6dm9pZCxub19zaWduYWw6dm9pZCxpZGxlOnZvaWQsYXJtaW5nOnZvaWQscmVjb3JkaW5nX3NkOnZvaWQsXzc6dm9pZCxsb29wX3Nsb3c6dm9pZCxfOTp2b2lkLGFybWVkOnZvaWQsYmF0dGVyeV9sb3c6dm9pZCxiYXR0ZXJ5X2NyaXRpY2FsOnZvaWQsbG9nX2Z1bGw6dm9pZCxjcmFzaF9kZXRlY3RlZDp2b2lkLG92ZXJyaWRlOnZvaWR9O0NvbG9yPXtyZWQ6dTgsZ3JlZW46dTgsYmx1ZTp1OH07TEVEU3RhdGVDb2xvcnM9e3JpZ2h0X2Zyb250OkNvbG9yLHJpZ2h0X2JhY2s6Q29sb3IsbGVmdF9mcm9udDpDb2xvcixsZWZ0X2JhY2s6Q29sb3J9O0xFRFN0YXRlQ2FzZT17c3RhdHVzOlN0YXR1c0ZsYWcscGF0dGVybjp1OCxjb2xvcnM6TEVEU3RhdGVDb2xvcnMsaW5kaWNhdG9yX3JlZDpib29sLGluZGljYXRvcl9ncmVlbjpib29sfTtMRURTdGF0ZXM9Wy8xNi9MRURTdGF0ZUNhc2U6MTZdO0xFRFN0YXRlc0ZpeGVkPVtMRURTdGF0ZUNhc2U6MTZdO0RldmljZU5hbWU9czk7SW5lcnRpYWxCaWFzPXthY2NlbDpWZWN0b3IzZixneXJvOlZlY3RvcjNmfTtWZWxvY2l0eVBJREJ5cGFzcz17LzgvZm9yd2FyZF9tYXN0ZXI6dm9pZCxyaWdodF9tYXN0ZXI6dm9pZCx1cF9tYXN0ZXI6dm9pZCxfdW51c2VkX21hc3Rlcjp2b2lkLGZvcndhcmRfc2xhdmU6dm9pZCxyaWdodF9zbGF2ZTp2b2lkLHVwX3NsYXZlOnZvaWQsX3VudXNlZF9zbGF2ZTp2b2lkfTtWZWxvY2l0eVBJRFBhcmFtZXRlcnM9e2ZvcndhcmRfbWFzdGVyOlBJRFNldHRpbmdzLHJpZ2h0X21hc3RlcjpQSURTZXR0aW5ncyx1cF9tYXN0ZXI6UElEU2V0dGluZ3MsZm9yd2FyZF9zbGF2ZTpQSURTZXR0aW5ncyxyaWdodF9zbGF2ZTpQSURTZXR0aW5ncyx1cF9zbGF2ZTpQSURTZXR0aW5ncyxwaWRfYnlwYXNzOlZlbG9jaXR5UElEQnlwYXNzfTtDb25maWd1cmF0aW9uPXsvMTYvdmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlcyxuYW1lOkRldmljZU5hbWUsdmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6VmVsb2NpdHlQSURQYXJhbWV0ZXJzLGluZXJ0aWFsX2JpYXM6SW5lcnRpYWxCaWFzfTtDb25maWd1cmF0aW9uRml4ZWQ9e3ZlcnNpb246VmVyc2lvbixpZDpDb25maWdJRCxwY2JfdHJhbnNmb3JtOlBjYlRyYW5zZm9ybSxtaXhfdGFibGU6TWl4VGFibGUsbWFnX2JpYXM6TWFnQmlhcyxjaGFubmVsOkNoYW5uZWxQcm9wZXJ0aWVzLHBpZF9wYXJhbWV0ZXJzOlBJRFBhcmFtZXRlcnMsc3RhdGVfcGFyYW1ldGVyczpTdGF0ZVBhcmFtZXRlcnMsbGVkX3N0YXRlczpMRURTdGF0ZXNGaXhlZCxuYW1lOkRldmljZU5hbWUsdmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6VmVsb2NpdHlQSURQYXJhbWV0ZXJzLGluZXJ0aWFsX2JpYXM6SW5lcnRpYWxCaWFzfTtDb25maWd1cmF0aW9uRmxhZz17LzE2L3ZlcnNpb246dm9pZCxpZDp2b2lkLHBjYl90cmFuc2Zvcm06dm9pZCxtaXhfdGFibGU6dm9pZCxtYWdfYmlhczp2b2lkLGNoYW5uZWw6dm9pZCxwaWRfcGFyYW1ldGVyczp2b2lkLHN0YXRlX3BhcmFtZXRlcnM6dm9pZCxsZWRfc3RhdGVzOlsvL3ZvaWQ6MTZdLG5hbWU6dm9pZCx2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczp2b2lkLGluZXJ0aWFsX2JpYXM6dm9pZH07Um90YXRpb249e3BpdGNoOmYzMixyb2xsOmYzMix5YXc6ZjMyfTtQSURTdGF0ZT17dGltZXN0YW1wX3VzOnUzMixpbnB1dDpmMzIsc2V0cG9pbnQ6ZjMyLHBfdGVybTpmMzIsaV90ZXJtOmYzMixkX3Rlcm06ZjMyfTtSY0NvbW1hbmQ9e3Rocm90dGxlOmkxNixwaXRjaDppMTYscm9sbDppMTYseWF3OmkxNn07U3RhdGU9ey8zMi90aW1lc3RhbXBfdXM6dTMyLHN0YXR1czpTdGF0dXNGbGFnLHYwX3Jhdzp1MTYsaTBfcmF3OnUxNixpMV9yYXc6dTE2LGFjY2VsOlZlY3RvcjNmLGd5cm86VmVjdG9yM2YsbWFnOlZlY3RvcjNmLHRlbXBlcmF0dXJlOnUxNixwcmVzc3VyZTp1MzIscHBtOltpMTY6Nl0sYXV4X2NoYW5fbWFzazp1OCxjb21tYW5kOlJjQ29tbWFuZCxjb250cm9sOntmejpmMzIsdHg6ZjMyLHR5OmYzMix0ejpmMzJ9LHBpZF9tYXN0ZXJfZno6UElEU3RhdGUscGlkX21hc3Rlcl90eDpQSURTdGF0ZSxwaWRfbWFzdGVyX3R5OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHo6UElEU3RhdGUscGlkX3NsYXZlX2Z6OlBJRFN0YXRlLHBpZF9zbGF2ZV90eDpQSURTdGF0ZSxwaWRfc2xhdmVfdHk6UElEU3RhdGUscGlkX3NsYXZlX3R6OlBJRFN0YXRlLG1vdG9yX291dDpbaTE2OjhdLGtpbmVtYXRpY3NfYW5nbGU6Um90YXRpb24sa2luZW1hdGljc19yYXRlOlJvdGF0aW9uLGtpbmVtYXRpY3NfYWx0aXR1ZGU6ZjMyLGxvb3BfY291bnQ6dTMyfTtTdGF0ZUZpZWxkcz17LzMyL3RpbWVzdGFtcF91czp2b2lkLHN0YXR1czp2b2lkLHYwX3Jhdzp2b2lkLGkwX3Jhdzp2b2lkLGkxX3Jhdzp2b2lkLGFjY2VsOnZvaWQsZ3lybzp2b2lkLG1hZzp2b2lkLHRlbXBlcmF0dXJlOnZvaWQscHJlc3N1cmU6dm9pZCxwcG06dm9pZCxhdXhfY2hhbl9tYXNrOnZvaWQsY29tbWFuZDp2b2lkLGNvbnRyb2w6dm9pZCxwaWRfbWFzdGVyX2Z6OnZvaWQscGlkX21hc3Rlcl90eDp2b2lkLHBpZF9tYXN0ZXJfdHk6dm9pZCxwaWRfbWFzdGVyX3R6OnZvaWQscGlkX3NsYXZlX2Z6OnZvaWQscGlkX3NsYXZlX3R4OnZvaWQscGlkX3NsYXZlX3R5OnZvaWQscGlkX3NsYXZlX3R6OnZvaWQsbW90b3Jfb3V0OnZvaWQsa2luZW1hdGljc19hbmdsZTp2b2lkLGtpbmVtYXRpY3NfcmF0ZTp2b2lkLGtpbmVtYXRpY3NfYWx0aXR1ZGU6dm9pZCxsb29wX2NvdW50OnZvaWR9O0F1eE1hc2s9ey8vYXV4MV9sb3c6dm9pZCxhdXgxX21pZDp2b2lkLGF1eDFfaGlnaDp2b2lkLGF1eDJfbG93OnZvaWQsYXV4Ml9taWQ6dm9pZCxhdXgyX2hpZ2g6dm9pZH07Q29tbWFuZD17LzMyL3JlcXVlc3RfcmVzcG9uc2U6dm9pZCxzZXRfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZpeGVkLHJlaW5pdF9lZXByb21fZGF0YTp2b2lkLHJlcXVlc3RfZWVwcm9tX2RhdGE6dm9pZCxyZXF1ZXN0X2VuYWJsZV9pdGVyYXRpb246dTgsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMDp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMTp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMjp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMzp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNDp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNTp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNjp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNzp1MTYsc2V0X2NvbW1hbmRfb3ZlcnJpZGU6Ym9vbCxzZXRfc3RhdGVfbWFzazpTdGF0ZUZpZWxkcyxzZXRfc3RhdGVfZGVsYXk6dTE2LHNldF9zZF93cml0ZV9kZWxheTp1MTYsc2V0X2xlZDp7cGF0dGVybjp1OCxjb2xvcl9yaWdodDpDb2xvcixjb2xvcl9sZWZ0OkNvbG9yLGluZGljYXRvcl9yZWQ6Ym9vbCxpbmRpY2F0b3JfZ3JlZW46Ym9vbH0sc2V0X3NlcmlhbF9yYzp7ZW5hYmxlZDpib29sLGNvbW1hbmQ6UmNDb21tYW5kLGF1eF9tYXNrOkF1eE1hc2t9LHNldF9jYXJkX3JlY29yZGluZ19zdGF0ZTp7LzgvcmVjb3JkX3RvX2NhcmQ6dm9pZCxsb2NrX3JlY29yZGluZ19zdGF0ZTp2b2lkfSxzZXRfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uLHJlaW5pdF9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GbGFnLHJlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GbGFnLHJlcV9jYXJkX3JlY29yZGluZ19zdGF0ZTp2b2lkLHNldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWc6Q29uZmlndXJhdGlvbixzZXRfY29tbWFuZF9zb3VyY2VzOnsvOC9zZXJpYWw6dm9pZCxyYWRpbzp2b2lkfSxzZXRfY2FsaWJyYXRpb246e2VuYWJsZWQ6Ym9vbCxtb2RlOnU4fSxzZXRfYXV0b3BpbG90X2VuYWJsZWQ6Ym9vbCxzZXRfdXNiX21vZGU6dTh9O0RlYnVnU3RyaW5nPXtkZXByZWNhdGVkX21hc2s6dTMyLG1lc3NhZ2U6c307SGlzdG9yeURhdGE9RGVidWdTdHJpbmc7UmVzcG9uc2U9e21hc2s6dTMyLGFjazp1MzJ9O1wiLFwiMS42LnR4dC5qc29uXCI6XCJ7XFxcInZlcnNpb25cXFwiOntcXFwibWFqb3JcXFwiOjEsXFxcIm1pbm9yXFxcIjo2LFxcXCJwYXRjaFxcXCI6MH0sXFxcImlkXFxcIjowLFxcXCJwY2JfdHJhbnNmb3JtXFxcIjp7XFxcIm9yaWVudGF0aW9uXFxcIjp7XFxcInhcXFwiOjAsXFxcInlcXFwiOjAsXFxcInpcXFwiOjB9LFxcXCJ0cmFuc2xhdGlvblxcXCI6e1xcXCJ4XFxcIjowLFxcXCJ5XFxcIjowLFxcXCJ6XFxcIjowfX0sXFxcIm1peF90YWJsZVxcXCI6e1xcXCJmelxcXCI6WzEsMSwxLDEsMSwxLDEsMV0sXFxcInR4XFxcIjpbMSwxLDEsMSwtMSwtMSwtMSwtMV0sXFxcInR5XFxcIjpbLTEsMSwtMSwxLC0xLDEsLTEsMV0sXFxcInR6XFxcIjpbMSwtMSwtMSwxLDEsLTEsLTEsMV19LFxcXCJtYWdfYmlhc1xcXCI6e1xcXCJvZmZzZXRcXFwiOntcXFwieFxcXCI6MCxcXFwieVxcXCI6MCxcXFwielxcXCI6MH19LFxcXCJjaGFubmVsXFxcIjp7XFxcImFzc2lnbm1lbnRcXFwiOntcXFwidGhydXN0XFxcIjoyLFxcXCJwaXRjaFxcXCI6MSxcXFwicm9sbFxcXCI6MCxcXFwieWF3XFxcIjozLFxcXCJhdXgxXFxcIjo0LFxcXCJhdXgyXFxcIjo1fSxcXFwiaW52ZXJzaW9uXFxcIjp7XFxcInRocnVzdFxcXCI6bnVsbCxcXFwicGl0Y2hcXFwiOnRydWUsXFxcInJvbGxcXFwiOnRydWUsXFxcInlhd1xcXCI6bnVsbCxcXFwiYXV4MVxcXCI6bnVsbCxcXFwiYXV4MlxcXCI6bnVsbH0sXFxcIm1pZHBvaW50XFxcIjpbMTUwMCwxNTAwLDE1MDAsMTUwMCwxNTAwLDE1MDBdLFxcXCJkZWFkem9uZVxcXCI6WzAsMCwwLDIwLDAsMF19LFxcXCJwaWRfcGFyYW1ldGVyc1xcXCI6e1xcXCJ0aHJ1c3RfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjoxLjAsXFxcImtpXFxcIjowLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxLjB9LFxcXCJwaXRjaF9tYXN0ZXJcXFwiOntcXFwia3BcXFwiOjMuNSxcXFwia2lcXFwiOjAuNSxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MzAuMH0sXFxcInJvbGxfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjozLjUsXFxcImtpXFxcIjowLjUsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAwLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjMwLjB9LFxcXCJ5YXdfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjoxLjAsXFxcImtpXFxcIjowLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxODAuMH0sXFxcInRocnVzdF9zbGF2ZVxcXCI6e1xcXCJrcFxcXCI6MS4wLFxcXCJraVxcXCI6MC4wLFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MS4wfSxcXFwicGl0Y2hfc2xhdmVcXFwiOntcXFwia3BcXFwiOjUuMCxcXFwia2lcXFwiOjIuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MTUwLjB9LFxcXCJyb2xsX3NsYXZlXFxcIjp7XFxcImtwXFxcIjo1LjAsXFxcImtpXFxcIjoyLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAwLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjE1MC4wfSxcXFwieWF3X3NsYXZlXFxcIjp7XFxcImtwXFxcIjo0MC4wLFxcXCJraVxcXCI6MTAuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MjQwLjB9LFxcXCJ0aHJ1c3RfZ2FpblxcXCI6NDA5NSxcXFwicGl0Y2hfZ2FpblxcXCI6MjA0NyxcXFwicm9sbF9nYWluXFxcIjoyMDQ3LFxcXCJ5YXdfZ2FpblxcXCI6MjA0NyxcXFwicGlkX2J5cGFzc1xcXCI6e1xcXCJ0aHJ1c3RfbWFzdGVyXFxcIjp0cnVlLFxcXCJwaXRjaF9tYXN0ZXJcXFwiOm51bGwsXFxcInJvbGxfbWFzdGVyXFxcIjpudWxsLFxcXCJ5YXdfbWFzdGVyXFxcIjp0cnVlLFxcXCJ0aHJ1c3Rfc2xhdmVcXFwiOnRydWUsXFxcInBpdGNoX3NsYXZlXFxcIjpudWxsLFxcXCJyb2xsX3NsYXZlXFxcIjpudWxsLFxcXCJ5YXdfc2xhdmVcXFwiOm51bGx9fSxcXFwic3RhdGVfcGFyYW1ldGVyc1xcXCI6e1xcXCJzdGF0ZV9lc3RpbWF0aW9uXFxcIjpbMSwwLjAxXSxcXFwiZW5hYmxlXFxcIjpbMC4wMDEsMzBdfSxcXFwibGVkX3N0YXRlc1xcXCI6W3tcXFwic3RhdHVzXFxcIjp7XFxcImNyYXNoX2RldGVjdGVkXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9mbGFzaH1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX09yYW5nZX1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwibG9vcF9zbG93XFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9zb2xpZH1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX1JlZH1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwib3ZlcnJpZGVcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX3NvbGlkfVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfTGlnaHRTZWFHcmVlbn1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwibG9nX2Z1bGxcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX2ZsYXNofVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfT3JhbmdlfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJub19zaWduYWxcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX2ZsYXNofVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfR3JlZW59XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LHtcXFwic3RhdHVzXFxcIjp7XFxcImFybWluZ1xcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fZmxhc2h9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9CbHVlfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJhcm1lZFxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fYmVhY29ufVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfQmx1ZX1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwiaWRsZVxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fYnJlYXRoZX1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX0dyZWVufVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSxcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIl0sXFxcIm5hbWVcXFwiOlxcXCJGTFlCUklYXFxcIixcXFwidmVsb2NpdHlfcGlkX3BhcmFtZXRlcnNcXFwiOntcXFwiZm9yd2FyZF9tYXN0ZXJcXFwiOntcXFwia3BcXFwiOjEsXFxcImtpXFxcIjowLFxcXCJrZFxcXCI6MCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjowLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxfSxcXFwicmlnaHRfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjoxMCxcXFwia2lcXFwiOjEsXFxcImtkXFxcIjowLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjEwLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxMH0sXFxcInVwX21hc3RlclxcXCI6e1xcXCJrcFxcXCI6MTAsXFxcImtpXFxcIjoxLFxcXCJrZFxcXCI6MCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjoxMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MTB9LFxcXCJmb3J3YXJkX3NsYXZlXFxcIjp7XFxcImtwXFxcIjoxLFxcXCJraVxcXCI6MCxcXFwia2RcXFwiOjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MTAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjAuM30sXFxcInJpZ2h0X3NsYXZlXFxcIjp7XFxcImtwXFxcIjoxMCxcXFwia2lcXFwiOjQsXFxcImtkXFxcIjowLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjMwLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjozMH0sXFxcInVwX3NsYXZlXFxcIjp7XFxcImtwXFxcIjoxMCxcXFwia2lcXFwiOjQsXFxcImtkXFxcIjowLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjMwLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjozMH0sXFxcInBpZF9ieXBhc3NcXFwiOntcXFwiZm9yd2FyZF9tYXN0ZXJcXFwiOnRydWUsXFxcInJpZ2h0X21hc3RlclxcXCI6dHJ1ZSxcXFwidXBfbWFzdGVyXFxcIjp0cnVlLFxcXCJmb3J3YXJkX3NsYXZlXFxcIjp0cnVlLFxcXCJyaWdodF9zbGF2ZVxcXCI6dHJ1ZSxcXFwidXBfc2xhdmVcXFwiOnRydWV9fSxcXFwiaW5lcnRpYWxfYmlhc1xcXCI6e1xcXCJhY2NlbFxcXCI6e1xcXCJ4XFxcIjowLFxcXCJ5XFxcIjowLFxcXCJ6XFxcIjowfSxcXFwiZ3lyb1xcXCI6e1xcXCJ4XFxcIjowLFxcXCJ5XFxcIjowLFxcXCJ6XFxcIjowfX19XCIsXCIxLjcudHh0XCI6XCJWZWN0b3IzZj17eDpmMzIseTpmMzIsejpmMzJ9O1BJRFNldHRpbmdzPXtrcDpmMzIsa2k6ZjMyLGtkOmYzMixpbnRlZ3JhbF93aW5kdXBfZ3VhcmQ6ZjMyLGRfZmlsdGVyX3RpbWU6ZjMyLHNldHBvaW50X2ZpbHRlcl90aW1lOmYzMixjb21tYW5kX3RvX3ZhbHVlOmYzMn07VmVyc2lvbj17bWFqb3I6dTgsbWlub3I6dTgscGF0Y2g6dTh9O0NvbmZpZ0lEPXUzMjtQY2JUcmFuc2Zvcm09e29yaWVudGF0aW9uOlZlY3RvcjNmLHRyYW5zbGF0aW9uOlZlY3RvcjNmfTtNaXhUYWJsZT17Zno6W2k4OjhdLHR4OltpODo4XSx0eTpbaTg6OF0sdHo6W2k4OjhdfTtNYWdCaWFzPXtvZmZzZXQ6VmVjdG9yM2Z9O0NoYW5uZWxQcm9wZXJ0aWVzPXthc3NpZ25tZW50Ont0aHJ1c3Q6dTgscGl0Y2g6dTgscm9sbDp1OCx5YXc6dTgsYXV4MTp1OCxhdXgyOnU4fSxpbnZlcnNpb246ey84L3RocnVzdDp2b2lkLHBpdGNoOnZvaWQscm9sbDp2b2lkLHlhdzp2b2lkLGF1eDE6dm9pZCxhdXgyOnZvaWR9LG1pZHBvaW50Olt1MTY6Nl0sZGVhZHpvbmU6W3UxNjo2XX07UElEQnlwYXNzPXsvOC90aHJ1c3RfbWFzdGVyOnZvaWQscGl0Y2hfbWFzdGVyOnZvaWQscm9sbF9tYXN0ZXI6dm9pZCx5YXdfbWFzdGVyOnZvaWQsdGhydXN0X3NsYXZlOnZvaWQscGl0Y2hfc2xhdmU6dm9pZCxyb2xsX3NsYXZlOnZvaWQseWF3X3NsYXZlOnZvaWR9O1BJRFBhcmFtZXRlcnM9e3RocnVzdF9tYXN0ZXI6UElEU2V0dGluZ3MscGl0Y2hfbWFzdGVyOlBJRFNldHRpbmdzLHJvbGxfbWFzdGVyOlBJRFNldHRpbmdzLHlhd19tYXN0ZXI6UElEU2V0dGluZ3MsdGhydXN0X3NsYXZlOlBJRFNldHRpbmdzLHBpdGNoX3NsYXZlOlBJRFNldHRpbmdzLHJvbGxfc2xhdmU6UElEU2V0dGluZ3MseWF3X3NsYXZlOlBJRFNldHRpbmdzLHRocnVzdF9nYWluOmYzMixwaXRjaF9nYWluOmYzMixyb2xsX2dhaW46ZjMyLHlhd19nYWluOmYzMixwaWRfYnlwYXNzOlBJREJ5cGFzc307U3RhdGVQYXJhbWV0ZXJzPXtzdGF0ZV9lc3RpbWF0aW9uOltmMzI6Ml0sZW5hYmxlOltmMzI6Ml19O1N0YXR1c0ZsYWc9ey8xNi9fMDp2b2lkLF8xOnZvaWQsXzI6dm9pZCxub19zaWduYWw6dm9pZCxpZGxlOnZvaWQsYXJtaW5nOnZvaWQscmVjb3JkaW5nX3NkOnZvaWQsXzc6dm9pZCxsb29wX3Nsb3c6dm9pZCxfOTp2b2lkLGFybWVkOnZvaWQsYmF0dGVyeV9sb3c6dm9pZCxiYXR0ZXJ5X2NyaXRpY2FsOnZvaWQsbG9nX2Z1bGw6dm9pZCxjcmFzaF9kZXRlY3RlZDp2b2lkLG92ZXJyaWRlOnZvaWR9O0NvbG9yPXtyZWQ6dTgsZ3JlZW46dTgsYmx1ZTp1OH07TEVEU3RhdGVDb2xvcnM9e3JpZ2h0X2Zyb250OkNvbG9yLHJpZ2h0X2JhY2s6Q29sb3IsbGVmdF9mcm9udDpDb2xvcixsZWZ0X2JhY2s6Q29sb3J9O0xFRFN0YXRlQ2FzZT17c3RhdHVzOlN0YXR1c0ZsYWcscGF0dGVybjp1OCxjb2xvcnM6TEVEU3RhdGVDb2xvcnMsaW5kaWNhdG9yX3JlZDpib29sLGluZGljYXRvcl9ncmVlbjpib29sfTtMRURTdGF0ZXM9Wy8xNi9MRURTdGF0ZUNhc2U6MTZdO0xFRFN0YXRlc0ZpeGVkPVtMRURTdGF0ZUNhc2U6MTZdO0RldmljZU5hbWU9czk7SW5lcnRpYWxCaWFzPXthY2NlbDpWZWN0b3IzZixneXJvOlZlY3RvcjNmfTtWZWxvY2l0eVBJREJ5cGFzcz17LzgvZm9yd2FyZF9tYXN0ZXI6dm9pZCxyaWdodF9tYXN0ZXI6dm9pZCx1cF9tYXN0ZXI6dm9pZCxfdW51c2VkX21hc3Rlcjp2b2lkLGZvcndhcmRfc2xhdmU6dm9pZCxyaWdodF9zbGF2ZTp2b2lkLHVwX3NsYXZlOnZvaWQsX3VudXNlZF9zbGF2ZTp2b2lkfTtWZWxvY2l0eVBJRFBhcmFtZXRlcnM9e2ZvcndhcmRfbWFzdGVyOlBJRFNldHRpbmdzLHJpZ2h0X21hc3RlcjpQSURTZXR0aW5ncyx1cF9tYXN0ZXI6UElEU2V0dGluZ3MsZm9yd2FyZF9zbGF2ZTpQSURTZXR0aW5ncyxyaWdodF9zbGF2ZTpQSURTZXR0aW5ncyx1cF9zbGF2ZTpQSURTZXR0aW5ncyxwaWRfYnlwYXNzOlZlbG9jaXR5UElEQnlwYXNzfTtDb25maWd1cmF0aW9uPXsvMTYvdmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlcyxuYW1lOkRldmljZU5hbWUsdmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6VmVsb2NpdHlQSURQYXJhbWV0ZXJzLGluZXJ0aWFsX2JpYXM6SW5lcnRpYWxCaWFzfTtDb25maWd1cmF0aW9uRml4ZWQ9e3ZlcnNpb246VmVyc2lvbixpZDpDb25maWdJRCxwY2JfdHJhbnNmb3JtOlBjYlRyYW5zZm9ybSxtaXhfdGFibGU6TWl4VGFibGUsbWFnX2JpYXM6TWFnQmlhcyxjaGFubmVsOkNoYW5uZWxQcm9wZXJ0aWVzLHBpZF9wYXJhbWV0ZXJzOlBJRFBhcmFtZXRlcnMsc3RhdGVfcGFyYW1ldGVyczpTdGF0ZVBhcmFtZXRlcnMsbGVkX3N0YXRlczpMRURTdGF0ZXNGaXhlZCxuYW1lOkRldmljZU5hbWUsdmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6VmVsb2NpdHlQSURQYXJhbWV0ZXJzLGluZXJ0aWFsX2JpYXM6SW5lcnRpYWxCaWFzfTtDb25maWd1cmF0aW9uRmxhZz17LzE2L3ZlcnNpb246dm9pZCxpZDp2b2lkLHBjYl90cmFuc2Zvcm06dm9pZCxtaXhfdGFibGU6dm9pZCxtYWdfYmlhczp2b2lkLGNoYW5uZWw6dm9pZCxwaWRfcGFyYW1ldGVyczp2b2lkLHN0YXRlX3BhcmFtZXRlcnM6dm9pZCxsZWRfc3RhdGVzOlsvL3ZvaWQ6MTZdLG5hbWU6dm9pZCx2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczp2b2lkLGluZXJ0aWFsX2JpYXM6dm9pZH07Um90YXRpb249e3BpdGNoOmYzMixyb2xsOmYzMix5YXc6ZjMyfTtQSURTdGF0ZT17dGltZXN0YW1wX3VzOnUzMixpbnB1dDpmMzIsc2V0cG9pbnQ6ZjMyLHBfdGVybTpmMzIsaV90ZXJtOmYzMixkX3Rlcm06ZjMyfTtSY0NvbW1hbmQ9e3Rocm90dGxlOmkxNixwaXRjaDppMTYscm9sbDppMTYseWF3OmkxNn07U3RhdGU9ey8zMi90aW1lc3RhbXBfdXM6dTMyLHN0YXR1czpTdGF0dXNGbGFnLHYwX3Jhdzp1MTYsaTBfcmF3OnUxNixpMV9yYXc6dTE2LGFjY2VsOlZlY3RvcjNmLGd5cm86VmVjdG9yM2YsbWFnOlZlY3RvcjNmLHRlbXBlcmF0dXJlOnUxNixwcmVzc3VyZTp1MzIscHBtOltpMTY6Nl0sYXV4X2NoYW5fbWFzazp1OCxjb21tYW5kOlJjQ29tbWFuZCxjb250cm9sOntmejpmMzIsdHg6ZjMyLHR5OmYzMix0ejpmMzJ9LHBpZF9tYXN0ZXJfZno6UElEU3RhdGUscGlkX21hc3Rlcl90eDpQSURTdGF0ZSxwaWRfbWFzdGVyX3R5OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHo6UElEU3RhdGUscGlkX3NsYXZlX2Z6OlBJRFN0YXRlLHBpZF9zbGF2ZV90eDpQSURTdGF0ZSxwaWRfc2xhdmVfdHk6UElEU3RhdGUscGlkX3NsYXZlX3R6OlBJRFN0YXRlLG1vdG9yX291dDpbaTE2OjhdLGtpbmVtYXRpY3NfYW5nbGU6Um90YXRpb24sa2luZW1hdGljc19yYXRlOlJvdGF0aW9uLGtpbmVtYXRpY3NfYWx0aXR1ZGU6ZjMyLGxvb3BfY291bnQ6dTMyfTtTdGF0ZUZpZWxkcz17LzMyL3RpbWVzdGFtcF91czp2b2lkLHN0YXR1czp2b2lkLHYwX3Jhdzp2b2lkLGkwX3Jhdzp2b2lkLGkxX3Jhdzp2b2lkLGFjY2VsOnZvaWQsZ3lybzp2b2lkLG1hZzp2b2lkLHRlbXBlcmF0dXJlOnZvaWQscHJlc3N1cmU6dm9pZCxwcG06dm9pZCxhdXhfY2hhbl9tYXNrOnZvaWQsY29tbWFuZDp2b2lkLGNvbnRyb2w6dm9pZCxwaWRfbWFzdGVyX2Z6OnZvaWQscGlkX21hc3Rlcl90eDp2b2lkLHBpZF9tYXN0ZXJfdHk6dm9pZCxwaWRfbWFzdGVyX3R6OnZvaWQscGlkX3NsYXZlX2Z6OnZvaWQscGlkX3NsYXZlX3R4OnZvaWQscGlkX3NsYXZlX3R5OnZvaWQscGlkX3NsYXZlX3R6OnZvaWQsbW90b3Jfb3V0OnZvaWQsa2luZW1hdGljc19hbmdsZTp2b2lkLGtpbmVtYXRpY3NfcmF0ZTp2b2lkLGtpbmVtYXRpY3NfYWx0aXR1ZGU6dm9pZCxsb29wX2NvdW50OnZvaWR9O0F1eE1hc2s9ey8vYXV4MV9sb3c6dm9pZCxhdXgxX21pZDp2b2lkLGF1eDFfaGlnaDp2b2lkLGF1eDJfbG93OnZvaWQsYXV4Ml9taWQ6dm9pZCxhdXgyX2hpZ2g6dm9pZH07Q29tbWFuZD17LzMyL3JlcXVlc3RfcmVzcG9uc2U6dm9pZCxzZXRfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZpeGVkLHJlaW5pdF9lZXByb21fZGF0YTp2b2lkLHJlcXVlc3RfZWVwcm9tX2RhdGE6dm9pZCxyZXF1ZXN0X2VuYWJsZV9pdGVyYXRpb246dTgsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMDp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMTp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMjp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMzp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNDp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNTp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNjp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNzp1MTYsc2V0X2NvbW1hbmRfb3ZlcnJpZGU6Ym9vbCxzZXRfc3RhdGVfbWFzazpTdGF0ZUZpZWxkcyxzZXRfc3RhdGVfZGVsYXk6dTE2LHNldF9zZF93cml0ZV9kZWxheTp1MTYsc2V0X2xlZDp7cGF0dGVybjp1OCxjb2xvcl9yaWdodF9mcm9udDpDb2xvcixjb2xvcl9sZWZ0X2Zyb250OkNvbG9yLGNvbG9yX3JpZ2h0X2JhY2s6Q29sb3IsY29sb3JfbGVmdF9iYWNrOkNvbG9yLGluZGljYXRvcl9yZWQ6Ym9vbCxpbmRpY2F0b3JfZ3JlZW46Ym9vbH0sc2V0X3NlcmlhbF9yYzp7ZW5hYmxlZDpib29sLGNvbW1hbmQ6UmNDb21tYW5kLGF1eF9tYXNrOkF1eE1hc2t9LHNldF9jYXJkX3JlY29yZGluZ19zdGF0ZTp7LzgvcmVjb3JkX3RvX2NhcmQ6dm9pZCxsb2NrX3JlY29yZGluZ19zdGF0ZTp2b2lkfSxzZXRfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uLHJlaW5pdF9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GbGFnLHJlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GbGFnLHJlcV9jYXJkX3JlY29yZGluZ19zdGF0ZTp2b2lkLHNldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWc6Q29uZmlndXJhdGlvbixzZXRfY29tbWFuZF9zb3VyY2VzOnsvOC9zZXJpYWw6dm9pZCxyYWRpbzp2b2lkfSxzZXRfY2FsaWJyYXRpb246e2VuYWJsZWQ6Ym9vbCxtb2RlOnU4fSxzZXRfYXV0b3BpbG90X2VuYWJsZWQ6Ym9vbCxzZXRfdXNiX21vZGU6dTh9O0RlYnVnU3RyaW5nPXtkZXByZWNhdGVkX21hc2s6dTMyLG1lc3NhZ2U6c307SGlzdG9yeURhdGE9RGVidWdTdHJpbmc7UmVzcG9uc2U9e21hc2s6dTMyLGFjazp1MzJ9O1wiLFwiMS43LnR4dC5qc29uXCI6XCJ7XFxcInZlcnNpb25cXFwiOntcXFwibWFqb3JcXFwiOjEsXFxcIm1pbm9yXFxcIjo3LFxcXCJwYXRjaFxcXCI6MH0sXFxcImlkXFxcIjowLFxcXCJwY2JfdHJhbnNmb3JtXFxcIjp7XFxcIm9yaWVudGF0aW9uXFxcIjp7XFxcInhcXFwiOjAsXFxcInlcXFwiOjAsXFxcInpcXFwiOjB9LFxcXCJ0cmFuc2xhdGlvblxcXCI6e1xcXCJ4XFxcIjowLFxcXCJ5XFxcIjowLFxcXCJ6XFxcIjowfX0sXFxcIm1peF90YWJsZVxcXCI6e1xcXCJmelxcXCI6WzEsMSwxLDEsMSwxLDEsMV0sXFxcInR4XFxcIjpbMSwxLDEsMSwtMSwtMSwtMSwtMV0sXFxcInR5XFxcIjpbLTEsMSwtMSwxLC0xLDEsLTEsMV0sXFxcInR6XFxcIjpbMSwtMSwtMSwxLDEsLTEsLTEsMV19LFxcXCJtYWdfYmlhc1xcXCI6e1xcXCJvZmZzZXRcXFwiOntcXFwieFxcXCI6MCxcXFwieVxcXCI6MCxcXFwielxcXCI6MH19LFxcXCJjaGFubmVsXFxcIjp7XFxcImFzc2lnbm1lbnRcXFwiOntcXFwidGhydXN0XFxcIjoyLFxcXCJwaXRjaFxcXCI6MSxcXFwicm9sbFxcXCI6MCxcXFwieWF3XFxcIjozLFxcXCJhdXgxXFxcIjo0LFxcXCJhdXgyXFxcIjo1fSxcXFwiaW52ZXJzaW9uXFxcIjp7XFxcInRocnVzdFxcXCI6bnVsbCxcXFwicGl0Y2hcXFwiOnRydWUsXFxcInJvbGxcXFwiOnRydWUsXFxcInlhd1xcXCI6bnVsbCxcXFwiYXV4MVxcXCI6bnVsbCxcXFwiYXV4MlxcXCI6bnVsbH0sXFxcIm1pZHBvaW50XFxcIjpbMTUwMCwxNTAwLDE1MDAsMTUwMCwxNTAwLDE1MDBdLFxcXCJkZWFkem9uZVxcXCI6WzAsMCwwLDIwLDAsMF19LFxcXCJwaWRfcGFyYW1ldGVyc1xcXCI6e1xcXCJ0aHJ1c3RfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjoxLjAsXFxcImtpXFxcIjowLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxLjB9LFxcXCJwaXRjaF9tYXN0ZXJcXFwiOntcXFwia3BcXFwiOjMuNSxcXFwia2lcXFwiOjAuNSxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MzAuMH0sXFxcInJvbGxfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjozLjUsXFxcImtpXFxcIjowLjUsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAwLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjMwLjB9LFxcXCJ5YXdfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjoxLjAsXFxcImtpXFxcIjowLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxODAuMH0sXFxcInRocnVzdF9zbGF2ZVxcXCI6e1xcXCJrcFxcXCI6MS4wLFxcXCJraVxcXCI6MC4wLFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MS4wfSxcXFwicGl0Y2hfc2xhdmVcXFwiOntcXFwia3BcXFwiOjUuMCxcXFwia2lcXFwiOjIuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MTUwLjB9LFxcXCJyb2xsX3NsYXZlXFxcIjp7XFxcImtwXFxcIjo1LjAsXFxcImtpXFxcIjoyLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAwLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjE1MC4wfSxcXFwieWF3X3NsYXZlXFxcIjp7XFxcImtwXFxcIjo0MC4wLFxcXCJraVxcXCI6MTAuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MjQwLjB9LFxcXCJ0aHJ1c3RfZ2FpblxcXCI6NDA5NSxcXFwicGl0Y2hfZ2FpblxcXCI6MjA0NyxcXFwicm9sbF9nYWluXFxcIjoyMDQ3LFxcXCJ5YXdfZ2FpblxcXCI6MjA0NyxcXFwicGlkX2J5cGFzc1xcXCI6e1xcXCJ0aHJ1c3RfbWFzdGVyXFxcIjp0cnVlLFxcXCJwaXRjaF9tYXN0ZXJcXFwiOm51bGwsXFxcInJvbGxfbWFzdGVyXFxcIjpudWxsLFxcXCJ5YXdfbWFzdGVyXFxcIjp0cnVlLFxcXCJ0aHJ1c3Rfc2xhdmVcXFwiOnRydWUsXFxcInBpdGNoX3NsYXZlXFxcIjpudWxsLFxcXCJyb2xsX3NsYXZlXFxcIjpudWxsLFxcXCJ5YXdfc2xhdmVcXFwiOm51bGx9fSxcXFwic3RhdGVfcGFyYW1ldGVyc1xcXCI6e1xcXCJzdGF0ZV9lc3RpbWF0aW9uXFxcIjpbMSwwLjAxXSxcXFwiZW5hYmxlXFxcIjpbMC4wMDEsMzBdfSxcXFwibGVkX3N0YXRlc1xcXCI6W3tcXFwic3RhdHVzXFxcIjp7XFxcImNyYXNoX2RldGVjdGVkXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9mbGFzaH1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX09yYW5nZX1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwibG9vcF9zbG93XFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9zb2xpZH1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX1JlZH1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwib3ZlcnJpZGVcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX3NvbGlkfVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfTGlnaHRTZWFHcmVlbn1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwibG9nX2Z1bGxcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX2ZsYXNofVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfT3JhbmdlfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJub19zaWduYWxcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX2ZsYXNofVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfR3JlZW59XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LHtcXFwic3RhdHVzXFxcIjp7XFxcImFybWluZ1xcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fZmxhc2h9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9CbHVlfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJhcm1lZFxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fYmVhY29ufVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfQmx1ZX1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwiaWRsZVxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fYnJlYXRoZX1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX0dyZWVufVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSxcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIl0sXFxcIm5hbWVcXFwiOlxcXCJGTFlCUklYXFxcIixcXFwidmVsb2NpdHlfcGlkX3BhcmFtZXRlcnNcXFwiOntcXFwiZm9yd2FyZF9tYXN0ZXJcXFwiOntcXFwia3BcXFwiOjEsXFxcImtpXFxcIjowLFxcXCJrZFxcXCI6MCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjowLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxfSxcXFwicmlnaHRfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjoxMCxcXFwia2lcXFwiOjEsXFxcImtkXFxcIjowLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjEwLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxMH0sXFxcInVwX21hc3RlclxcXCI6e1xcXCJrcFxcXCI6MTAsXFxcImtpXFxcIjoxLFxcXCJrZFxcXCI6MCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjoxMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MTB9LFxcXCJmb3J3YXJkX3NsYXZlXFxcIjp7XFxcImtwXFxcIjoxLFxcXCJraVxcXCI6MCxcXFwia2RcXFwiOjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MTAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjAuM30sXFxcInJpZ2h0X3NsYXZlXFxcIjp7XFxcImtwXFxcIjoxMCxcXFwia2lcXFwiOjQsXFxcImtkXFxcIjowLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjMwLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjozMH0sXFxcInVwX3NsYXZlXFxcIjp7XFxcImtwXFxcIjoxMCxcXFwia2lcXFwiOjQsXFxcImtkXFxcIjowLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjMwLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjozMH0sXFxcInBpZF9ieXBhc3NcXFwiOntcXFwiZm9yd2FyZF9tYXN0ZXJcXFwiOnRydWUsXFxcInJpZ2h0X21hc3RlclxcXCI6dHJ1ZSxcXFwidXBfbWFzdGVyXFxcIjp0cnVlLFxcXCJmb3J3YXJkX3NsYXZlXFxcIjp0cnVlLFxcXCJyaWdodF9zbGF2ZVxcXCI6dHJ1ZSxcXFwidXBfc2xhdmVcXFwiOnRydWV9fSxcXFwiaW5lcnRpYWxfYmlhc1xcXCI6e1xcXCJhY2NlbFxcXCI6e1xcXCJ4XFxcIjowLFxcXCJ5XFxcIjowLFxcXCJ6XFxcIjowfSxcXFwiZ3lyb1xcXCI6e1xcXCJ4XFxcIjowLFxcXCJ5XFxcIjowLFxcXCJ6XFxcIjowfX19XCJ9O1xuICAgICAgICByZXR1cm4geyB2ZXJzaW9uczogdmVyc2lvbnMsIGZpbGVzOiBmaWxlcyB9O1xuICAgIH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY2FsaWJyYXRpb24nLCBjYWxpYnJhdGlvbik7XHJcblxyXG4gICAgY2FsaWJyYXRpb24uJGluamVjdCA9IFsnY29tbWFuZExvZycsICdzZXJpYWwnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjYWxpYnJhdGlvbihjb21tYW5kTG9nLCBzZXJpYWwpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBtYWduZXRvbWV0ZXI6IG1hZ25ldG9tZXRlcixcclxuICAgICAgICAgICAgYWNjZWxlcm9tZXRlcjoge1xyXG4gICAgICAgICAgICAgICAgZmxhdDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdmbGF0JywgMCksXHJcbiAgICAgICAgICAgICAgICBmb3J3YXJkOiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gZm9yd2FyZCcsIDEpLFxyXG4gICAgICAgICAgICAgICAgYmFjazogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIGJhY2snLCAyKSxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gcmlnaHQnLCAzKSxcclxuICAgICAgICAgICAgICAgIGxlZnQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiBsZWZ0JywgNCksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZpbmlzaDogZmluaXNoLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG1hZ25ldG9tZXRlcigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcIkNhbGlicmF0aW5nIG1hZ25ldG9tZXRlciBiaWFzXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiAwLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FsaWJyYXRlQWNjZWxlcm9tZXRlcihwb3NlRGVzY3JpcHRpb24sIHBvc2VJZCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiQ2FsaWJyYXRpbmcgZ3Jhdml0eSBmb3IgcG9zZTogXCIgKyBwb3NlRGVzY3JpcHRpb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiBwb3NlSWQgKyAxLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZmluaXNoKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiRmluaXNoaW5nIGNhbGlicmF0aW9uXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogMCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2NvYnMnLCBjb2JzKTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb2JzKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIFJlYWRlcjogUmVhZGVyLFxyXG4gICAgICAgICAgICBlbmNvZGU6IGVuY29kZSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBSZWFkZXIoY2FwYWNpdHkpIHtcclxuICAgICAgICBpZiAoY2FwYWNpdHkgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjYXBhY2l0eSA9IDIwMDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuTiA9IGNhcGFjaXR5O1xyXG4gICAgICAgIHRoaXMuYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoY2FwYWNpdHkpO1xyXG4gICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmJ1ZmZlcl9sZW5ndGggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvYnNEZWNvZGUocmVhZGVyKSB7XHJcbiAgICAgICAgdmFyIHNyY19wdHIgPSAwO1xyXG4gICAgICAgIHZhciBkc3RfcHRyID0gMDtcclxuICAgICAgICB2YXIgbGVmdG92ZXJfbGVuZ3RoID0gMDtcclxuICAgICAgICB2YXIgYXBwZW5kX3plcm8gPSBmYWxzZTtcclxuICAgICAgICB3aGlsZSAocmVhZGVyLmJ1ZmZlcltzcmNfcHRyXSkge1xyXG4gICAgICAgICAgICBpZiAoIWxlZnRvdmVyX2xlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFwcGVuZF96ZXJvKVxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWRlci5idWZmZXJbZHN0X3B0cisrXSA9IDA7XHJcbiAgICAgICAgICAgICAgICBsZWZ0b3Zlcl9sZW5ndGggPSByZWFkZXIuYnVmZmVyW3NyY19wdHIrK10gLSAxO1xyXG4gICAgICAgICAgICAgICAgYXBwZW5kX3plcm8gPSBsZWZ0b3Zlcl9sZW5ndGggPCAweEZFO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLS1sZWZ0b3Zlcl9sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICByZWFkZXIuYnVmZmVyW2RzdF9wdHIrK10gPSByZWFkZXIuYnVmZmVyW3NyY19wdHIrK107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBsZWZ0b3Zlcl9sZW5ndGggPyAwIDogZHN0X3B0cjtcclxuICAgIH1cclxuXHJcbiAgICBSZWFkZXIucHJvdG90eXBlLnJlYWRCeXRlcyA9IGZ1bmN0aW9uKGRhdGEsIG9uU3VjY2Vzcywgb25FcnJvcikge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgYyA9IGRhdGFbaV07XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlyc3QgYnl0ZSBvZiBhIG5ldyBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJfbGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5idWZmZXJbdGhpcy5idWZmZXJfbGVuZ3RoKytdID0gYztcclxuXHJcbiAgICAgICAgICAgIGlmIChjKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWZmZXJfbGVuZ3RoID09PSB0aGlzLk4pIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBidWZmZXIgb3ZlcmZsb3csIHByb2JhYmx5IGR1ZSB0byBlcnJvcnMgaW4gZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ292ZXJmbG93JywgJ2J1ZmZlciBvdmVyZmxvdyBpbiBDT0JTIGRlY29kaW5nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyX2xlbmd0aCA9IGNvYnNEZWNvZGUodGhpcyk7XHJcbiAgICAgICAgICAgIHZhciBmYWlsZWRfZGVjb2RlID0gKHRoaXMuYnVmZmVyX2xlbmd0aCA9PT0gMCk7XHJcbiAgICAgICAgICAgIGlmIChmYWlsZWRfZGVjb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlclswXSA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGo7XHJcbiAgICAgICAgICAgIGZvciAoaiA9IDE7IGogPCB0aGlzLmJ1ZmZlcl9sZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJbMF0gXj0gdGhpcy5idWZmZXJbal07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYnVmZmVyWzBdID09PSAwKSB7ICAvLyBjaGVjayBzdW0gaXMgY29ycmVjdFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYnVmZmVyX2xlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3ModGhpcy5idWZmZXIuc2xpY2UoMSwgdGhpcy5idWZmZXJfbGVuZ3RoKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ3Nob3J0JywgJ1RvbyBzaG9ydCBwYWNrZXQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHsgIC8vIGJhZCBjaGVja3N1bVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIGJ5dGVzID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCB0aGlzLmJ1ZmZlcl9sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ5dGVzICs9IHRoaXMuYnVmZmVyW2pdICsgXCIsXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHRoaXMuYnVmZmVyW2pdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChmYWlsZWRfZGVjb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignZnJhbWUnLCAnVW5leHBlY3RlZCBlbmRpbmcgb2YgcGFja2V0Jyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtc2cgPSAnQkFEIENIRUNLU1VNICgnICsgdGhpcy5idWZmZXJfbGVuZ3RoICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJyBieXRlcyknICsgYnl0ZXMgKyBtZXNzYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ2NoZWNrc3VtJywgbXNnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZW5jb2RlKGJ1Zikge1xyXG4gICAgICAgIHZhciByZXR2YWwgPVxyXG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShNYXRoLmZsb29yKChidWYuYnl0ZUxlbmd0aCAqIDI1NSArIDc2MSkgLyAyNTQpKTtcclxuICAgICAgICB2YXIgbGVuID0gMTtcclxuICAgICAgICB2YXIgcG9zX2N0ciA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWYubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgaWYgKHJldHZhbFtwb3NfY3RyXSA9PSAweEZFKSB7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbcG9zX2N0cl0gPSAweEZGO1xyXG4gICAgICAgICAgICAgICAgcG9zX2N0ciA9IGxlbisrO1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW3Bvc19jdHJdID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdmFsID0gYnVmW2ldO1xyXG4gICAgICAgICAgICArK3JldHZhbFtwb3NfY3RyXTtcclxuICAgICAgICAgICAgaWYgKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW2xlbisrXSA9IHZhbDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBvc19jdHIgPSBsZW4rKztcclxuICAgICAgICAgICAgICAgIHJldHZhbFtwb3NfY3RyXSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJldHZhbC5zdWJhcnJheSgwLCBsZW4pLnNsaWNlKCkuYnVmZmVyO1xyXG4gICAgfTtcclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY29tbWFuZExvZycsIGNvbW1hbmRMb2cpO1xyXG5cclxuICAgIGNvbW1hbmRMb2cuJGluamVjdCA9IFsnJHEnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb21tYW5kTG9nKCRxKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gW107XHJcbiAgICAgICAgdmFyIHJlc3BvbmRlciA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIHZhciBzZXJ2aWNlID0gbG9nO1xyXG4gICAgICAgIHNlcnZpY2UubG9nID0gbG9nO1xyXG4gICAgICAgIHNlcnZpY2UuY2xlYXJTdWJzY3JpYmVycyA9IGNsZWFyU3Vic2NyaWJlcnM7XHJcbiAgICAgICAgc2VydmljZS5vbk1lc3NhZ2UgPSBvbk1lc3NhZ2U7XHJcbiAgICAgICAgc2VydmljZS5yZWFkID0gcmVhZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlcnZpY2U7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxvZyhtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICByZXNwb25kZXIubm90aWZ5KHJlYWQoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlYWQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFyU3Vic2NyaWJlcnMoKSB7XHJcbiAgICAgICAgICAgIHJlc3BvbmRlciA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvbk1lc3NhZ2UoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbmRlci5wcm9taXNlLnRoZW4odW5kZWZpbmVkLCB1bmRlZmluZWQsIGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2RldmljZUNvbmZpZycsIGRldmljZUNvbmZpZyk7XHJcblxyXG4gICAgZGV2aWNlQ29uZmlnLiRpbmplY3QgPSBbJ3NlcmlhbCcsICdjb21tYW5kTG9nJywgJ2Zpcm13YXJlVmVyc2lvbicsICdzZXJpYWxpemF0aW9uSGFuZGxlciddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGRldmljZUNvbmZpZyhzZXJpYWwsIGNvbW1hbmRMb2csIGZpcm13YXJlVmVyc2lvbiwgc2VyaWFsaXphdGlvbkhhbmRsZXIpIHtcclxuICAgICAgICB2YXIgY29uZmlnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gY2FsbGJhY2sgZGVmaW5lZCBmb3IgcmVjZWl2aW5nIGNvbmZpZ3VyYXRpb25zIScpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBsb2dnaW5nQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICdObyBjYWxsYmFjayBkZWZpbmVkIGZvciByZWNlaXZpbmcgbG9nZ2luZyBzdGF0ZSEnICtcclxuICAgICAgICAgICAgICAgICcgQ2FsbGJhY2sgYXJndW1lbnRzOiAoaXNMb2dnaW5nLCBpc0xvY2tlZCwgZGVsYXkpJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VyaWFsLmFkZE9uUmVjZWl2ZUNhbGxiYWNrKGZ1bmN0aW9uKG1lc3NhZ2VUeXBlLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSAhPT0gJ0NvbW1hbmQnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCdzZXRfZWVwcm9tX2RhdGEnIGluIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUNvbmZpZ0Zyb21SZW1vdGVEYXRhKG1lc3NhZ2Uuc2V0X2VlcHJvbV9kYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3NldF9wYXJ0aWFsX2VlcHJvbV9kYXRhJyBpbiBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVDb25maWdGcm9tUmVtb3RlRGF0YShtZXNzYWdlLnNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKCdzZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGUnIGluIG1lc3NhZ2UpICYmICgnc2V0X3NkX3dyaXRlX2RlbGF5JyBpbiBtZXNzYWdlKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNhcmRfcmVjX3N0YXRlID0gbWVzc2FnZS5zZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGU7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2Rfd3JpdGVfZGVsYXkgPSBtZXNzYWdlLnNldF9zZF93cml0ZV9kZWxheTtcclxuICAgICAgICAgICAgICAgIGxvZ2dpbmdDYWxsYmFjayhjYXJkX3JlY19zdGF0ZS5yZWNvcmRfdG9fY2FyZCwgY2FyZF9yZWNfc3RhdGUubG9ja19yZWNvcmRpbmdfc3RhdGUsIHNkX3dyaXRlX2RlbGF5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXREZXNpcmVkVmVyc2lvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZpcm13YXJlVmVyc2lvbi5kZXNpcmVkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdCgpIHtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXJzID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCk7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ1JlcXVlc3RpbmcgY3VycmVudCBjb25maWd1cmF0aW9uIGRhdGEuLi4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBoYW5kbGVycy5Db25maWd1cmF0aW9uRmxhZy5lbXB0eSgpLFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZWluaXQoKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ1NldHRpbmcgZmFjdG9yeSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZGF0YS4uLicpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmVpbml0X2VlcHJvbV9kYXRhOiB0cnVlLFxyXG4gICAgICAgICAgICB9LCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUmVxdWVzdCBmb3IgZmFjdG9yeSByZXNldCBmYWlsZWQ6ICcgKyByZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZChuZXdDb25maWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbmRDb25maWcoeyBjb25maWc6IG5ld0NvbmZpZywgdGVtcG9yYXJ5OiBmYWxzZSwgcmVxdWVzdFVwZGF0ZTogdHJ1ZSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRDb25maWcocHJvcGVydGllcykge1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlcnMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKTtcclxuICAgICAgICAgICAgdmFyIG1hc2sgPSBwcm9wZXJ0aWVzLm1hc2sgfHwgaGFuZGxlcnMuQ29uZmlndXJhdGlvbkZsYWcuZW1wdHkoKTtcclxuICAgICAgICAgICAgdmFyIG5ld0NvbmZpZyA9IHByb3BlcnRpZXMuY29uZmlnIHx8IGNvbmZpZztcclxuICAgICAgICAgICAgdmFyIHJlcXVlc3RVcGRhdGUgPSBwcm9wZXJ0aWVzLnJlcXVlc3RVcGRhdGUgfHwgZmFsc2U7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKHByb3BlcnRpZXMudGVtcG9yYXJ5KSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlLnNldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWcgPSBuZXdDb25maWc7XHJcbiAgICAgICAgICAgICAgICBtYXNrID0geyBzZXRfcGFydGlhbF90ZW1wb3JhcnlfY29uZmlnOiBtYXNrIH07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlLnNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhID0gbmV3Q29uZmlnO1xyXG4gICAgICAgICAgICAgICAgbWFzayA9IHsgc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGE6IG1hc2sgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCBtZXNzYWdlLCB0cnVlLCBtYXNrKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3RVcGRhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlQ29uZmlnRnJvbVJlbW90ZURhdGEoY29uZmlnQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAvL2NvbW1hbmRMb2coJ1JlY2VpdmVkIGNvbmZpZyEnKTtcclxuICAgICAgICAgICAgY29uZmlnID0gc2VyaWFsaXphdGlvbkhhbmRsZXIudXBkYXRlRmllbGRzKGNvbmZpZywgY29uZmlnQ2hhbmdlcyk7XHJcbiAgICAgICAgICAgIHZhciB2ZXJzaW9uID0gW2NvbmZpZy52ZXJzaW9uLm1ham9yLCBjb25maWcudmVyc2lvbi5taW5vciwgY29uZmlnLnZlcnNpb24ucGF0Y2hdO1xyXG4gICAgICAgICAgICBmaXJtd2FyZVZlcnNpb24uc2V0KHZlcnNpb24pO1xyXG4gICAgICAgICAgICBpZiAoIWZpcm13YXJlVmVyc2lvbi5zdXBwb3J0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZygnUmVjZWl2ZWQgYW4gdW5zdXBwb3J0ZWQgY29uZmlndXJhdGlvbiEnKTtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAgICAgJ0ZvdW5kIHZlcnNpb246ICcgKyB2ZXJzaW9uWzBdICsgJy4nICsgdmVyc2lvblsxXSArICcuJyArIHZlcnNpb25bMl0gICtcclxuICAgICAgICAgICAgICAgICAgICAnIC0tLSBOZXdlc3QgdmVyc2lvbjogJyArXHJcbiAgICAgICAgICAgICAgICAgICAgZmlybXdhcmVWZXJzaW9uLmRlc2lyZWRLZXkoKSApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICAgICAnUmVjZWl2ZWQgY29uZmlndXJhdGlvbiBkYXRhICh2JyArXHJcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvblswXSArICcuJyArIHZlcnNpb25bMV0gKyAnLicgKyB2ZXJzaW9uWzJdICsnKScpO1xyXG4gICAgICAgICAgICAgICAgY29uZmlnQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Q29uZmlnQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgY29uZmlnQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldExvZ2dpbmdDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBsb2dnaW5nQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldENvbmZpZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZyA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpLkNvbmZpZ3VyYXRpb24uZW1wdHkoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVxdWVzdDogcmVxdWVzdCxcclxuICAgICAgICAgICAgcmVpbml0OiByZWluaXQsXHJcbiAgICAgICAgICAgIHNlbmQ6IHNlbmQsXHJcbiAgICAgICAgICAgIHNlbmRDb25maWc6IHNlbmRDb25maWcsXHJcbiAgICAgICAgICAgIGdldENvbmZpZzogZ2V0Q29uZmlnLFxyXG4gICAgICAgICAgICBzZXRDb25maWdDYWxsYmFjazogc2V0Q29uZmlnQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHNldExvZ2dpbmdDYWxsYmFjazogc2V0TG9nZ2luZ0NhbGxiYWNrLFxyXG4gICAgICAgICAgICBnZXREZXNpcmVkVmVyc2lvbjogZ2V0RGVzaXJlZFZlcnNpb24sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2RldmljZUNvbmZpZ1BhcnNlcicsIGRldmljZUNvbmZpZ1BhcnNlcik7XHJcblxyXG4gICAgZGV2aWNlQ29uZmlnUGFyc2VyLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBkZXZpY2VDb25maWdQYXJzZXIoKSB7XHJcbiAgICAgICAgdmFyIGNvbnN0YW50cyA9IHt9O1xyXG5cclxuICAgICAgICB2YXIgcGF0dGVybnMgPSB7XHJcbiAgICAgICAgICAgIG5vbmU6IDAsXHJcbiAgICAgICAgICAgIHNvbGlkOiA1LFxyXG4gICAgICAgICAgICBmbGFzaDogMSxcclxuICAgICAgICAgICAgYnJlYXRoZTogMyxcclxuICAgICAgICAgICAgYmVhY29uOiAyLFxyXG4gICAgICAgICAgICBhbHRlcm5hdGU6IDQsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXMocGF0dGVybnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICBjb25zdGFudHNbJ1BBVFRFUk5fJyArIGtleV0gPSBKU09OLnN0cmluZ2lmeShwYXR0ZXJuc1trZXldKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIGNvbG9yX3BhbGV0dGUgPSB7XHJcbiAgICAgICAgICAgIFBsYWlkOiB7cmVkOiAyMDQsIGdyZWVuOiA4NSwgYmx1ZTogNTF9LFxyXG4gICAgICAgICAgICBEYXJrTWFnZW50YToge3JlZDogMTM5LCBncmVlbjogMCwgYmx1ZTogMTM5fSxcclxuICAgICAgICAgICAgUmVkOiB7cmVkOiAyNTUsIGdyZWVuOiAwLCBibHVlOiAwfSxcclxuICAgICAgICAgICAgT3JhbmdlUmVkOiB7cmVkOiAyNTUsIGdyZWVuOiA2OSwgYmx1ZTogMH0sXHJcbiAgICAgICAgICAgIE9yYW5nZToge3JlZDogMjU1LCBncmVlbjogMTY1LCBibHVlOiAwfSxcclxuICAgICAgICAgICAgWWVsbG93OiB7cmVkOiAyNTUsIGdyZWVuOiAyNTUsIGJsdWU6IDB9LFxyXG4gICAgICAgICAgICBXaGl0ZToge3JlZDogMjU1LCBncmVlbjogMjU1LCBibHVlOiAyNTV9LFxyXG4gICAgICAgICAgICBCbGFjazoge3JlZDogMCwgZ3JlZW46IDAsIGJsdWU6IDB9LFxyXG4gICAgICAgICAgICBCbHVlOiB7cmVkOiAwLCBncmVlbjogMCwgYmx1ZTogMjU1fSxcclxuICAgICAgICAgICAgTGlnaHRTZWFHcmVlbjoge3JlZDogMzIsIGdyZWVuOiAxNzgsIGJsdWU6IDE3MH0sXHJcbiAgICAgICAgICAgIEdyZWVuOiB7cmVkOiAwLCBncmVlbjogMTI4LCBibHVlOiAwfSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiB1bmlmb3JtRmFkZWRDb2xvcihjKSB7XHJcbiAgICAgICAgICAgIHZhciBzY2FsZSA9ICgyNTYuMCAtIDIzMC4wKSAvIDI1Ni4wOyAvLyBtYXRjaGVzIGZhZGUgZnVuY3Rpb24gaW4gZmlybXdhcmVcclxuICAgICAgICAgICAgdmFyIHIgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigyNTUsIE1hdGgucm91bmQoc2NhbGUgKiBjLnJlZCkpKTtcclxuICAgICAgICAgICAgdmFyIGcgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigyNTUsIE1hdGgucm91bmQoc2NhbGUgKiBjLmdyZWVuKSkpO1xyXG4gICAgICAgICAgICB2YXIgYiA9IE1hdGgubWF4KDAsIE1hdGgubWluKDI1NSwgTWF0aC5yb3VuZChzY2FsZSAqIGMuYmx1ZSkpKTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHJpZ2h0X2Zyb250OiB7cmVkOiByLCBncmVlbjogZywgYmx1ZTogYn0sXHJcbiAgICAgICAgICAgICAgICByaWdodF9iYWNrOiB7cmVkOiByLCBncmVlbjogZywgYmx1ZTogYn0sXHJcbiAgICAgICAgICAgICAgICBsZWZ0X2Zyb250OiB7cmVkOiByLCBncmVlbjogZywgYmx1ZTogYn0sXHJcbiAgICAgICAgICAgICAgICBsZWZ0X2JhY2s6IHtyZWQ6IHIsIGdyZWVuOiBnLCBibHVlOiBifVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXMoY29sb3JfcGFsZXR0ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnN0YW50c1snQ09MT1JfJyArIGtleV0gPSBKU09OLnN0cmluZ2lmeSh1bmlmb3JtRmFkZWRDb2xvcihjb2xvcl9wYWxldHRlW2tleV0pKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3RhbnRzWydMRURfdW51c2VkX21vZGUnXSA9ICd7XCJzdGF0dXNcIjp7fSxcInBhdHRlcm5cIjonICsgY29uc3RhbnRzLlBBVFRFUk5fbm9uZSArICcsXCJjb2xvcnNcIjonICsgY29uc3RhbnRzLkNPTE9SX0JsYWNrICsgJyxcImluZGljYXRvcl9yZWRcIjpmYWxzZSxcImluZGljYXRvcl9ncmVlblwiOmZhbHNlfSc7XHJcblxyXG4gICAgICAgIHZhciByZWdleCA9IC9cIlxcJHsoXFx3Kyl9XCIvZztcclxuXHJcbiAgICAgICAgdmFyIGNvbnN0X2ZpbGxlciA9IGZ1bmN0aW9uIChmdWxsX21hdGNoLCBsYWJlbCkge1xyXG4gICAgICAgICAgICBpZiAobGFiZWwgaW4gY29uc3RhbnRzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uc3RhbnRzW2xhYmVsXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbnN0YW50IFwiJyArIGxhYmVsICsgJ1wiIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhpcyB2ZXJzaW9uIG9mIGZseWJyaXgtY29tbW9uLicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBwYXJzZSA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEucmVwbGFjZShyZWdleCwgY29uc3RfZmlsbGVyKSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtwYXJzZTogcGFyc2V9O1xyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdmaXJtd2FyZVZlcnNpb24nLCBmaXJtd2FyZVZlcnNpb24pO1xyXG5cclxuICAgIGZpcm13YXJlVmVyc2lvbi4kaW5qZWN0ID0gWydzZXJpYWxpemF0aW9uSGFuZGxlciddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGZpcm13YXJlVmVyc2lvbihzZXJpYWxpemF0aW9uSGFuZGxlcikge1xyXG4gICAgICAgIHZhciB2ZXJzaW9uID0gWzAsIDAsIDBdO1xyXG4gICAgICAgIHZhciBrZXkgPSAnMC4wLjAnO1xyXG5cclxuICAgICAgICB2YXIgbmV3ZXN0VmVyc2lvbiA9IHNlcmlhbGl6YXRpb25IYW5kbGVyLmdldE5ld2VzdFZlcnNpb24oKTtcclxuXHJcbiAgICAgICAgdmFyIGRlc2lyZWQgPSBbbmV3ZXN0VmVyc2lvbi5tYWpvciwgbmV3ZXN0VmVyc2lvbi5taW5vciwgbmV3ZXN0VmVyc2lvbi5wYXRjaF07XHJcbiAgICAgICAgdmFyIGRlc2lyZWRLZXkgPSBkZXNpcmVkWzBdLnRvU3RyaW5nKCkgKyAnLicgKyBkZXNpcmVkWzFdLnRvU3RyaW5nKCkgKyAnLicgKyBkZXNpcmVkWzJdLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIHZhciBkZWZhdWx0U2VyaWFsaXphdGlvbkhhbmRsZXIgPSBzZXJpYWxpemF0aW9uSGFuZGxlci5nZXRIYW5kbGVyKGRlc2lyZWRLZXkpO1xyXG4gICAgICAgIHZhciBkZWZhdWx0RGVmYXVsdHMgPSBzZXJpYWxpemF0aW9uSGFuZGxlci5nZXREZWZhdWx0cyhkZXNpcmVkS2V5KTtcclxuICAgICAgICB2YXIgY3VycmVudFNlcmlhbGl6YXRpb25IYW5kbGVyID0gZGVmYXVsdFNlcmlhbGl6YXRpb25IYW5kbGVyO1xyXG4gICAgICAgIHZhciBjdXJyZW50RGVmYXVsdHMgPSBkZWZhdWx0RGVmYXVsdHM7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHZlcnNpb24gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGtleSA9IHZhbHVlLmpvaW4oJy4nKTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlciA9IHNlcmlhbGl6YXRpb25IYW5kbGVyLmdldEhhbmRsZXIoZGVzaXJlZEtleSkgfHwgZGVmYXVsdFNlcmlhbGl6YXRpb25IYW5kbGVyO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudERlZmF1bHRzID0gc2VyaWFsaXphdGlvbkhhbmRsZXIuZ2V0RGVmYXVsdHMoZGVzaXJlZEtleSkgfHwgZGVmYXVsdERlZmF1bHRzO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZlcnNpb247XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGtleTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ga2V5O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdXBwb3J0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICEhc2VyaWFsaXphdGlvbkhhbmRsZXIuZ2V0SGFuZGxlcihrZXkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZXNpcmVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXNpcmVkO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZXNpcmVkS2V5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXNpcmVkS2V5O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXJpYWxpemF0aW9uSGFuZGxlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudFNlcmlhbGl6YXRpb25IYW5kbGVyO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZWZhdWx0czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudERlZmF1bHRzO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnbGVkJywgbGVkKTtcclxuXHJcbiAgICBsZWQuJGluamVjdCA9IFsnJHEnLCAnc2VyaWFsJ107XHJcblxyXG4gICAgZnVuY3Rpb24gbGVkKCRxLCBzZXJpYWwpIHtcclxuICAgICAgICB2YXIgTGVkUGF0dGVybnMgPSB7XHJcbiAgICAgICAgICAgIE5PX09WRVJSSURFOiAwLFxyXG4gICAgICAgICAgICBGTEFTSDogMSxcclxuICAgICAgICAgICAgQkVBQ09OOiAyLFxyXG4gICAgICAgICAgICBCUkVBVEhFOiAzLFxyXG4gICAgICAgICAgICBBTFRFUk5BVEU6IDQsXHJcbiAgICAgICAgICAgIFNPTElEOiA1LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciB1cmdlbnQgPSBmYWxzZTtcclxuICAgICAgICB2YXIgYmxhY2sgPSB7cmVkOiAwLCBncmVlbjogMCwgYmx1ZTogMH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldChyaWdodF9mcm9udCwgcmlnaHRfYmFjaywgbGVmdF9mcm9udCwgbGVmdF9iYWNrLCBwYXR0ZXJuLCByZWQsIGdyZWVuKSB7XHJcbiAgICAgICAgICAgIGlmICghdXJnZW50ICYmIHNlcmlhbC5idXN5KCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoJ1NlcmlhbCBjb25uZWN0aW9uIGlzIHRvbyBidXN5Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdXJnZW50ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBwYXR0ZXJuID0gcGF0dGVybiB8fCBMZWRQYXR0ZXJucy5OT19PVkVSUklERTtcclxuICAgICAgICAgICAgaWYgKHBhdHRlcm4gPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gTGVkUGF0dGVybnMuTk9fT1ZFUlJJREU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGF0dGVybiA+IDUpIHtcclxuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBMZWRQYXR0ZXJucy5TT0xJRDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHNldHRlcl9jb21tYW5kID0ge1xyXG4gICAgICAgICAgICAgICAgcGF0dGVybjogcGF0dGVybixcclxuICAgICAgICAgICAgICAgIGNvbG9yX3JpZ2h0OiByaWdodF9mcm9udCB8fCBibGFjayxcclxuICAgICAgICAgICAgICAgIGNvbG9yX2xlZnQ6IGxlZnRfZnJvbnQgfHwgYmxhY2ssXHJcbiAgICAgICAgICAgICAgICBjb2xvcl9yaWdodF9mcm9udDogcmlnaHRfZnJvbnQgfHwgYmxhY2ssXHJcbiAgICAgICAgICAgICAgICBjb2xvcl9sZWZ0X2Zyb250OiBsZWZ0X2Zyb250IHx8IGJsYWNrLFxyXG4gICAgICAgICAgICAgICAgY29sb3JfcmlnaHRfYmFjazogcmlnaHRfYmFjayB8fCBibGFjayxcclxuICAgICAgICAgICAgICAgIGNvbG9yX2xlZnRfYmFjazogbGVmdF9iYWNrIHx8IGJsYWNrLFxyXG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yX3JlZDogcmVkLFxyXG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yX2dyZWVuOiBncmVlbixcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzZXRfbGVkOiBzZXR0ZXJfY29tbWFuZCxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0U2ltcGxlKHJlZCwgZ3JlZW4sIGJsdWUpIHtcclxuICAgICAgICAgICAgdmFyIGNvbG9yID0ge3JlZDogcmVkIHx8IDAsIGdyZWVuOiBncmVlbiB8fCAwLCBibHVlOiBibHVlIHx8IDB9O1xyXG4gICAgICAgICAgICByZXR1cm4gc2V0KGNvbG9yLCBjb2xvciwgY29sb3IsIGNvbG9yLCBMZWRQYXR0ZXJucy5TT0xJRCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjbGVhcigpIHtcclxuICAgICAgICAgICAgZm9yY2VOZXh0U2VuZCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2V0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBmb3JjZU5leHRTZW5kKCkge1xyXG4gICAgICAgICAgICB1cmdlbnQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0OiBzZXQsXHJcbiAgICAgICAgICAgIHNldFNpbXBsZTogc2V0U2ltcGxlLFxyXG4gICAgICAgICAgICBjbGVhcjogY2xlYXIsXHJcbiAgICAgICAgICAgIHBhdHRlcm5zOiBMZWRQYXR0ZXJucyxcclxuICAgICAgICAgICAgZm9yY2VOZXh0U2VuZDogZm9yY2VOZXh0U2VuZCxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgncmNEYXRhJywgcmNEYXRhKTtcclxuXHJcbiAgICByY0RhdGEuJGluamVjdCA9IFsnc2VyaWFsJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcmNEYXRhKHNlcmlhbCkge1xyXG4gICAgICAgIHZhciBBVVggPSB7XHJcbiAgICAgICAgICAgIExPVzogMCxcclxuICAgICAgICAgICAgTUlEOiAxLFxyXG4gICAgICAgICAgICBISUdIOiAyLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGF1eE5hbWVzID0gWydsb3cnLCAnbWlkJywgJ2hpZ2gnXTtcclxuXHJcbiAgICAgICAgdmFyIHRocm90dGxlID0gLTE7XHJcbiAgICAgICAgdmFyIHBpdGNoID0gMDtcclxuICAgICAgICB2YXIgcm9sbCA9IDA7XHJcbiAgICAgICAgdmFyIHlhdyA9IDA7XHJcbiAgICAgICAgLy8gZGVmYXVsdHMgdG8gaGlnaCAtLSBsb3cgaXMgZW5hYmxpbmc7IGhpZ2ggaXMgZGlzYWJsaW5nXHJcbiAgICAgICAgdmFyIGF1eDEgPSBBVVguSElHSDtcclxuICAgICAgICAvLyBkZWZhdWx0cyB0byA/PyAtLSBuZWVkIHRvIGNoZWNrIHRyYW5zbWl0dGVyIGJlaGF2aW9yXHJcbiAgICAgICAgdmFyIGF1eDIgPSBBVVguSElHSDtcclxuXHJcbiAgICAgICAgdmFyIHVyZ2VudCA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNldFRocm90dGxlOiBzZXRUaHJvdHRsZSxcclxuICAgICAgICAgICAgc2V0UGl0Y2g6IHNldFBpdGNoLFxyXG4gICAgICAgICAgICBzZXRSb2xsOiBzZXRSb2xsLFxyXG4gICAgICAgICAgICBzZXRZYXc6IHNldFlhdyxcclxuICAgICAgICAgICAgc2V0QXV4MTogc2V0QXV4MSxcclxuICAgICAgICAgICAgc2V0QXV4Mjogc2V0QXV4MixcclxuICAgICAgICAgICAgZ2V0VGhyb3R0bGU6IGdldFRocm90dGxlLFxyXG4gICAgICAgICAgICBnZXRQaXRjaDogZ2V0UGl0Y2gsXHJcbiAgICAgICAgICAgIGdldFJvbGw6IGdldFJvbGwsXHJcbiAgICAgICAgICAgIGdldFlhdzogZ2V0WWF3LFxyXG4gICAgICAgICAgICBnZXRBdXgxOiBnZXRBdXgxLFxyXG4gICAgICAgICAgICBnZXRBdXgyOiBnZXRBdXgyLFxyXG4gICAgICAgICAgICBBVVg6IEFVWCxcclxuICAgICAgICAgICAgc2VuZDogc2VuZCxcclxuICAgICAgICAgICAgZm9yY2VOZXh0U2VuZDogZm9yY2VOZXh0U2VuZCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kKCkge1xyXG4gICAgICAgICAgICBpZiAoIXVyZ2VudCAmJiBzZXJpYWwuYnVzeSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdXJnZW50ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB2YXIgY29tbWFuZCA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy8gaW52ZXJ0IHBpdGNoIGFuZCByb2xsXHJcbiAgICAgICAgICAgIHZhciB0aHJvdHRsZV90aHJlc2hvbGQgPVxyXG4gICAgICAgICAgICAgICAgLTAuODsgIC8vIGtlZXAgYm90dG9tIDEwJSBvZiB0aHJvdHRsZSBzdGljayB0byBtZWFuICdvZmYnXHJcbiAgICAgICAgICAgIGNvbW1hbmQudGhyb3R0bGUgPSBjb25zdHJhaW4oXHJcbiAgICAgICAgICAgICAgICAodGhyb3R0bGUgLSB0aHJvdHRsZV90aHJlc2hvbGQpICogNDA5NSAvXHJcbiAgICAgICAgICAgICAgICAgICAgKDEgLSB0aHJvdHRsZV90aHJlc2hvbGQpLFxyXG4gICAgICAgICAgICAgICAgMCwgNDA5NSk7XHJcbiAgICAgICAgICAgIGNvbW1hbmQucGl0Y2ggPVxyXG4gICAgICAgICAgICAgICAgY29uc3RyYWluKC0oYXBwbHlEZWFkem9uZShwaXRjaCwgMC4xKSkgKiA0MDk1IC8gMiwgLTIwNDcsIDIwNDcpO1xyXG4gICAgICAgICAgICBjb21tYW5kLnJvbGwgPVxyXG4gICAgICAgICAgICAgICAgY29uc3RyYWluKChhcHBseURlYWR6b25lKHJvbGwsIDAuMSkpICogNDA5NSAvIDIsIC0yMDQ3LCAyMDQ3KTtcclxuICAgICAgICAgICAgY29tbWFuZC55YXcgPVxyXG4gICAgICAgICAgICAgICAgY29uc3RyYWluKC0oYXBwbHlEZWFkem9uZSh5YXcsIDAuMSkpICogNDA5NSAvIDIsIC0yMDQ3LCAyMDQ3KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBhdXhfbWFzayA9IHt9O1xyXG4gICAgICAgICAgICAvLyBhdXgxX2xvdywgYXV4MV9taWQsIGF1eDFfaGlnaCwgYW5kIHNhbWUgd2l0aCBhdXgyXHJcbiAgICAgICAgICAgIGF1eF9tYXNrWydhdXgxXycgKyBhdXhOYW1lc1thdXgxXV0gPSB0cnVlO1xyXG4gICAgICAgICAgICBhdXhfbWFza1snYXV4Ml8nICsgYXV4TmFtZXNbYXV4Ml1dID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzZXRfc2VyaWFsX3JjOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBjb21tYW5kOiBjb21tYW5kLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1eF9tYXNrOiBhdXhfbWFzayxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFRocm90dGxlKHYpIHtcclxuICAgICAgICAgICAgdGhyb3R0bGUgPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0UGl0Y2godikge1xyXG4gICAgICAgICAgICBwaXRjaCA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRSb2xsKHYpIHtcclxuICAgICAgICAgICAgcm9sbCA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRZYXcodikge1xyXG4gICAgICAgICAgICB5YXcgPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0QXV4MSh2KSB7XHJcbiAgICAgICAgICAgIGF1eDEgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigyLCB2KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRBdXgyKHYpIHtcclxuICAgICAgICAgICAgYXV4MiA9IE1hdGgubWF4KDAsIE1hdGgubWluKDIsIHYpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFRocm90dGxlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhyb3R0bGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRQaXRjaCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBpdGNoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0Um9sbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJvbGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRZYXcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB5YXc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRBdXgxKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXV4MTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEF1eDIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhdXgyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZm9yY2VOZXh0U2VuZCgpIHtcclxuICAgICAgICAgICAgdXJnZW50ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNvbnN0cmFpbih4LCB4bWluLCB4bWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLm1heCh4bWluLCBNYXRoLm1pbih4LCB4bWF4KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcHBseURlYWR6b25lKHZhbHVlLCBkZWFkem9uZSkge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPiBkZWFkem9uZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlIC0gZGVhZHpvbmU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHZhbHVlIDwgLWRlYWR6b25lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgKyBkZWFkem9uZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3NlcmlhbCcsIHNlcmlhbCk7XHJcblxyXG4gICAgc2VyaWFsLiRpbmplY3QgPSBbJyR0aW1lb3V0JywgJyRxJywgJ2NvYnMnLCAnY29tbWFuZExvZycsICdmaXJtd2FyZVZlcnNpb24nLCAnc2VyaWFsaXphdGlvbkhhbmRsZXInXTtcclxuXHJcbiAgICBmdW5jdGlvbiBzZXJpYWwoJHRpbWVvdXQsICRxLCBjb2JzLCBjb21tYW5kTG9nLCBmaXJtd2FyZVZlcnNpb24sIHNlcmlhbGl6YXRpb25IYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIE1lc3NhZ2VUeXBlID0ge1xyXG4gICAgICAgICAgICBTdGF0ZTogMCxcclxuICAgICAgICAgICAgQ29tbWFuZDogMSxcclxuICAgICAgICAgICAgRGVidWdTdHJpbmc6IDMsXHJcbiAgICAgICAgICAgIEhpc3RvcnlEYXRhOiA0LFxyXG4gICAgICAgICAgICBQcm90b2NvbDogMTI4LFxyXG4gICAgICAgICAgICBSZXNwb25zZTogMjU1LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBhY2tub3dsZWRnZXMgPSBbXTtcclxuICAgICAgICB2YXIgYmFja2VuZCA9IG5ldyBCYWNrZW5kKCk7XHJcblxyXG4gICAgICAgIHZhciBvblJlY2VpdmVMaXN0ZW5lcnMgPSBbXTtcclxuXHJcbiAgICAgICAgdmFyIGNvYnNSZWFkZXIgPSBuZXcgY29icy5SZWFkZXIoMTAwMDApO1xyXG4gICAgICAgIHZhciBieXRlc0hhbmRsZXIgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEJhY2tlbmQoKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBCYWNrZW5kLnByb3RvdHlwZS5idXN5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBCYWNrZW5kLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdObyBcInNlbmRcIiBkZWZpbmVkIGZvciBzZXJpYWwgYmFja2VuZCcpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIEJhY2tlbmQucHJvdG90eXBlLm9uUmVhZCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gXCJvblJlYWRcIiBkZWZpbmVkIGZvciBzZXJpYWwgYmFja2VuZCcpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBNZXNzYWdlVHlwZUludmVyc2lvbiA9IFtdO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKE1lc3NhZ2VUeXBlKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICBNZXNzYWdlVHlwZUludmVyc2lvbltNZXNzYWdlVHlwZVtrZXldXSA9IGtleTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYWRkT25SZWNlaXZlQ2FsbGJhY2soZnVuY3Rpb24obWVzc2FnZVR5cGUsIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlID09PSAnUmVzcG9uc2UnKSB7XHJcbiAgICAgICAgICAgICAgICBhY2tub3dsZWRnZShtZXNzYWdlLm1hc2ssIG1lc3NhZ2UuYWNrKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChtZXNzYWdlVHlwZSA9PT0gJ1Byb3RvY29sJykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBtZXNzYWdlLnJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uSGFuZGxlci5hZGRIYW5kbGVyKGRhdGEudmVyc2lvbiwgZGF0YS5zdHJ1Y3R1cmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGJ1c3k6IGJ1c3ksXHJcbiAgICAgICAgICAgIHNlbmRTdHJ1Y3R1cmU6IHNlbmRTdHJ1Y3R1cmUsXHJcbiAgICAgICAgICAgIHNldEJhY2tlbmQ6IHNldEJhY2tlbmQsXHJcbiAgICAgICAgICAgIGFkZE9uUmVjZWl2ZUNhbGxiYWNrOiBhZGRPblJlY2VpdmVDYWxsYmFjayxcclxuICAgICAgICAgICAgcmVtb3ZlT25SZWNlaXZlQ2FsbGJhY2s6IHJlbW92ZU9uUmVjZWl2ZUNhbGxiYWNrLFxyXG4gICAgICAgICAgICBzZXRCeXRlc0hhbmRsZXI6IHNldEJ5dGVzSGFuZGxlcixcclxuICAgICAgICAgICAgaGFuZGxlUG9zdENvbm5lY3Q6IGhhbmRsZVBvc3RDb25uZWN0LFxyXG4gICAgICAgICAgICBCYWNrZW5kOiBCYWNrZW5kLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEJhY2tlbmQodikge1xyXG4gICAgICAgICAgICBiYWNrZW5kID0gdjtcclxuICAgICAgICAgICAgYmFja2VuZC5vblJlYWQgPSByZWFkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlUG9zdENvbm5lY3QoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0RmlybXdhcmVWZXJzaW9uKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZXF1ZXN0RmlybXdhcmVWZXJzaW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXFfcGFydGlhbF9lZXByb21fZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb246IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRTdHJ1Y3R1cmUobWVzc2FnZVR5cGUsIGRhdGEsIGxvZ19zZW5kLCBleHRyYU1hc2spIHtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlID09PSAnU3RhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gcHJvY2Vzc1N0YXRlT3V0cHV0KGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVycyA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgaWYgKCEobWVzc2FnZVR5cGUgaW4gTWVzc2FnZVR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZS5yZWplY3QoJ01lc3NhZ2UgdHlwZSBcIicgKyBtZXNzYWdlVHlwZSArXHJcbiAgICAgICAgICAgICAgICAgICAgJ1wiIG5vdCBzdXBwb3J0ZWQgYnkgYXBwLCBzdXBwb3J0ZWQgbWVzc2FnZSB0eXBlcyBhcmU6JyArXHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoTWVzc2FnZVR5cGUpLmpvaW4oJywgJykpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCEobWVzc2FnZVR5cGUgaW4gaGFuZGxlcnMpKSB7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZS5yZWplY3QoJ01lc3NhZ2UgdHlwZSBcIicgKyBtZXNzYWdlVHlwZSArXHJcbiAgICAgICAgICAgICAgICAgICAgJ1wiIG5vdCBzdXBwb3J0ZWQgYnkgZmlybXdhcmUsIHN1cHBvcnRlZCBtZXNzYWdlIHR5cGVzIGFyZTonICtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhoYW5kbGVycykuam9pbignLCAnKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdHlwZUNvZGUgPSBNZXNzYWdlVHlwZVttZXNzYWdlVHlwZV07XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gaGFuZGxlcnNbbWVzc2FnZVR5cGVdO1xyXG5cclxuICAgICAgICAgICAgdmFyIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGhhbmRsZXIuYnl0ZUNvdW50KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBzZXJpYWxpemVyID0gbmV3IHNlcmlhbGl6YXRpb25IYW5kbGVyLlNlcmlhbGl6ZXIobmV3IERhdGFWaWV3KGJ1ZmZlci5idWZmZXIpKTtcclxuICAgICAgICAgICAgaGFuZGxlci5lbmNvZGUoc2VyaWFsaXplciwgZGF0YSwgZXh0cmFNYXNrKTtcclxuICAgICAgICAgICAgdmFyIG1hc2sgPSBoYW5kbGVyLm1hc2tBcnJheShkYXRhLCBleHRyYU1hc2spO1xyXG4gICAgICAgICAgICBpZiAobWFzay5sZW5ndGggPCA1KSB7XHJcbiAgICAgICAgICAgICAgICBtYXNrID0gKG1hc2tbMF0gPDwgMCkgfCAobWFza1sxXSA8PCA4KSB8IChtYXNrWzJdIDw8IDE2KSB8IChtYXNrWzNdIDw8IDI0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGRhdGFMZW5ndGggPSBzZXJpYWxpemVyLmluZGV4O1xyXG5cclxuICAgICAgICAgICAgdmFyIG91dHB1dCA9IG5ldyBVaW50OEFycmF5KGRhdGFMZW5ndGggKyAzKTtcclxuICAgICAgICAgICAgb3V0cHV0WzBdID0gb3V0cHV0WzFdID0gdHlwZUNvZGU7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGRhdGFMZW5ndGg7ICsraWR4KSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXRbMF0gXj0gb3V0cHV0W2lkeCArIDJdID0gYnVmZmVyW2lkeF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3V0cHV0W2RhdGFMZW5ndGggKyAyXSA9IDA7XHJcblxyXG4gICAgICAgICAgICBhY2tub3dsZWRnZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBtYXNrOiBtYXNrLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2U6IHJlc3BvbnNlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgYmFja2VuZC5zZW5kKG5ldyBVaW50OEFycmF5KGNvYnMuZW5jb2RlKG91dHB1dCkpKTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobG9nX3NlbmQpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coJ1NlbmRpbmcgY29tbWFuZCAnICsgdHlwZUNvZGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGJ1c3koKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYWNrZW5kLmJ1c3koKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEJ5dGVzSGFuZGxlcihoYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIGJ5dGVzSGFuZGxlciA9IGhhbmRsZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZWFkKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGJ5dGVzSGFuZGxlcilcclxuICAgICAgICAgICAgICAgIGJ5dGVzSGFuZGxlcihkYXRhLCBwcm9jZXNzRGF0YSk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGNvYnNSZWFkZXIucmVhZEJ5dGVzKGRhdGEsIHByb2Nlc3NEYXRhLCByZXBvcnRJc3N1ZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVwb3J0SXNzdWVzKGlzc3VlLCB0ZXh0KSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ0NPQlMgZGVjb2RpbmcgZmFpbGVkICgnICsgaXNzdWUgKyAnKTogJyArIHRleHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWRkT25SZWNlaXZlQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgb25SZWNlaXZlTGlzdGVuZXJzID0gb25SZWNlaXZlTGlzdGVuZXJzLmNvbmNhdChbY2FsbGJhY2tdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZU9uUmVjZWl2ZUNhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIG9uUmVjZWl2ZUxpc3RlbmVycyA9IG9uUmVjZWl2ZUxpc3RlbmVycy5maWx0ZXIoZnVuY3Rpb24oY2IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjYiAhPT0gY2FsbGJhY2s7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWNrbm93bGVkZ2UobWFzaywgdmFsdWUpIHtcclxuICAgICAgICAgICAgd2hpbGUgKGFja25vd2xlZGdlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IGFja25vd2xlZGdlcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHYubWFzayBeIG1hc2spIHtcclxuICAgICAgICAgICAgICAgICAgICB2LnJlc3BvbnNlLnJlamVjdCgnTWlzc2luZyBBQ0snKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciByZWxheGVkTWFzayA9IG1hc2s7XHJcbiAgICAgICAgICAgICAgICByZWxheGVkTWFzayAmPSB+MTtcclxuICAgICAgICAgICAgICAgIGlmIChyZWxheGVkTWFzayBeIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdi5yZXNwb25zZS5yZWplY3QoJ1JlcXVlc3Qgd2FzIG5vdCBmdWxseSBwcm9jZXNzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHYucmVzcG9uc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NEYXRhKGJ5dGVzKSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlVHlwZSA9IE1lc3NhZ2VUeXBlSW52ZXJzaW9uW2J5dGVzWzBdXTtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKVttZXNzYWdlVHlwZV07XHJcbiAgICAgICAgICAgIGlmICghbWVzc2FnZVR5cGUgfHwgIWhhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coJ0lsbGVnYWwgbWVzc2FnZSB0eXBlIHBhc3NlZCBmcm9tIGZpcm13YXJlJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHZhciBzZXJpYWxpemVyID0gbmV3IHNlcmlhbGl6YXRpb25IYW5kbGVyLlNlcmlhbGl6ZXIobmV3IERhdGFWaWV3KGJ5dGVzLmJ1ZmZlciwgMSkpO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBoYW5kbGVyLmRlY29kZShzZXJpYWxpemVyKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdVbnJlY29nbml6ZWQgbWVzc2FnZSBmb3JtYXQgcmVjZWl2ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWVzc2FnZVR5cGUgPT09ICdTdGF0ZScpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBwcm9jZXNzU3RhdGVJbnB1dChtZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvblJlY2VpdmVMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbihsaXN0ZW5lcikge1xyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXIobWVzc2FnZVR5cGUsIG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBsYXN0X3RpbWVzdGFtcF91cyA9IDA7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NTdGF0ZUlucHV0KHN0YXRlKSB7XHJcbiAgICAgICAgICAgIHN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUpO1xyXG4gICAgICAgICAgICB2YXIgc2VyaWFsX3VwZGF0ZV9yYXRlX0h6ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmICgndGltZXN0YW1wX3VzJyBpbiBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUuc2VyaWFsX3VwZGF0ZV9yYXRlX2VzdGltYXRlID0gMTAwMDAwMCAvIChzdGF0ZS50aW1lc3RhbXBfdXMgLSBsYXN0X3RpbWVzdGFtcF91cyk7XHJcbiAgICAgICAgICAgICAgICBsYXN0X3RpbWVzdGFtcF91cyA9IHN0YXRlLnRpbWVzdGFtcF91cztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3RlbXBlcmF0dXJlJyBpbiBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUudGVtcGVyYXR1cmUgLz0gMTAwLjA7ICAvLyB0ZW1wZXJhdHVyZSBnaXZlbiBpbiBDZWxzaXVzICogMTAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCdwcmVzc3VyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnByZXNzdXJlIC89IDI1Ni4wOyAgLy8gcHJlc3N1cmUgZ2l2ZW4gaW4gKFEyNC44KSBmb3JtYXRcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJvY2Vzc1N0YXRlT3V0cHV0KHN0YXRlKSB7XHJcbiAgICAgICAgICAgIHN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUpO1xyXG4gICAgICAgICAgICBpZiAoJ3RlbXBlcmF0dXJlJyBpbiBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUudGVtcGVyYXR1cmUgKj0gMTAwLjA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCdwcmVzc3VyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnByZXNzdXJlICo9IDI1Ni4wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgc2VyaWFsaXphdGlvbkhhbmRsZXIuJGluamVjdCA9IFsnZGVzY3JpcHRvcnNIYW5kbGVyJywgJ2RldmljZUNvbmZpZ1BhcnNlciddO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnc2VyaWFsaXphdGlvbkhhbmRsZXInLCBzZXJpYWxpemF0aW9uSGFuZGxlcik7XHJcblxyXG4gICAgZnVuY3Rpb24gc2VyaWFsaXphdGlvbkhhbmRsZXIoZGVzY3JpcHRvcnNIYW5kbGVyLCBkZXZpY2VDb25maWdQYXJzZXIpIHtcclxuICAgICAgICB2YXIgaGFuZGxlckNhY2hlID0ge307XHJcbiAgICAgICAgdmFyIGRlZmF1bHRzQ2FjaGUgPSB7fTtcclxuXHJcbiAgICAgICAgdmFyIG5ld2VzdFZlcnNpb24gPSB7IG1ham9yOiAwLCBtaW5vcjogMCwgcGF0Y2g6IDAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaXNOZXdlclZlcnNpb24odmVyc2lvbikge1xyXG4gICAgICAgICAgICBpZiAodmVyc2lvbi5tYWpvciAhPT0gbmV3ZXN0VmVyc2lvbi5tYWpvcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZlcnNpb24ubWFqb3IgPiBuZXdlc3RWZXJzaW9uLm1ham9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh2ZXJzaW9uLm1pbm9yICE9PSBuZXdlc3RWZXJzaW9uLm1pbm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmVyc2lvbi5taW5vciA+IG5ld2VzdFZlcnNpb24ubWlub3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHZlcnNpb24ucGF0Y2ggPiBuZXdlc3RWZXJzaW9uLnBhdGNoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdmVyc2lvblRvU3RyaW5nKHZlcnNpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZlcnNpb24ubWFqb3IudG9TdHJpbmcoKSArICcuJyArIHZlcnNpb24ubWlub3IudG9TdHJpbmcoKSArICcuJyArIHZlcnNpb24ucGF0Y2gudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHN0cmluZ1RvVmVyc2lvbih2ZXJzaW9uKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IHZlcnNpb24uc3BsaXQoJy4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIG1ham9yOiBwYXJzZUludChwYXJ0c1swXSksXHJcbiAgICAgICAgICAgICAgICBtaW5vcjogcGFyc2VJbnQocGFydHNbMV0pLFxyXG4gICAgICAgICAgICAgICAgcGF0Y2g6IHBhcnNlSW50KHBhcnRzWzJdKSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFkZEhhbmRsZXIodmVyc2lvbiwgc3RydWN0dXJlLCBkZWZhdWx0cykge1xyXG4gICAgICAgICAgICBpZiAoaXNOZXdlclZlcnNpb24odmVyc2lvbikpIHtcclxuICAgICAgICAgICAgICAgIG5ld2VzdFZlcnNpb24gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFqb3I6IHZlcnNpb24ubWFqb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgbWlub3I6IHZlcnNpb24ubWlub3IsXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0Y2g6IHZlcnNpb24ucGF0Y2gsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB2ZXJzaW9uU3RyID0gdmVyc2lvblRvU3RyaW5nKHZlcnNpb24pO1xyXG4gICAgICAgICAgICBoYW5kbGVyQ2FjaGVbdmVyc2lvblN0cl0gPSBGbHlicml4U2VyaWFsaXphdGlvbi5wYXJzZShzdHJ1Y3R1cmUpO1xyXG4gICAgICAgICAgICBkZWZhdWx0c0NhY2hlW3ZlcnNpb25TdHJdID0gZGV2aWNlQ29uZmlnUGFyc2VyLnBhcnNlKGRlZmF1bHRzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNvcHlIYW5kbGVyKHZlcnNpb24sIHNyY1ZlcnNpb24pIHtcclxuICAgICAgICAgICAgaWYgKGlzTmV3ZXJWZXJzaW9uKHZlcnNpb24pKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdlc3RWZXJzaW9uID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ham9yOiB2ZXJzaW9uLm1ham9yLFxyXG4gICAgICAgICAgICAgICAgICAgIG1pbm9yOiB2ZXJzaW9uLm1pbm9yLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhdGNoOiB2ZXJzaW9uLnBhdGNoLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdmVyc2lvblN0ciA9IHZlcnNpb25Ub1N0cmluZyh2ZXJzaW9uKTtcclxuICAgICAgICAgICAgdmFyIHNyY1ZlcnNpb25TdHIgPSB2ZXJzaW9uVG9TdHJpbmcoc3JjVmVyc2lvbik7XHJcbiAgICAgICAgICAgIGhhbmRsZXJDYWNoZVt2ZXJzaW9uU3RyXSA9IGhhbmRsZXJDYWNoZVtzcmNWZXJzaW9uU3RyXTtcclxuICAgICAgICAgICAgZGVmYXVsdHNDYWNoZVt2ZXJzaW9uU3RyXSA9IGRlZmF1bHRzQ2FjaGVbc3JjVmVyc2lvblN0cl07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZGVzY1ZlcnNpb25zID0gZGVzY3JpcHRvcnNIYW5kbGVyLnZlcnNpb25zO1xyXG4gICAgICAgIHZhciBkZXNjRmlsZXMgPSBkZXNjcmlwdG9yc0hhbmRsZXIuZmlsZXM7XHJcbiAgICAgICAgdmFyIGRlc2NSZXZlcnNlTWFwID0ge307XHJcbiAgICAgICAgT2JqZWN0LmtleXMoZGVzY1ZlcnNpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgdmVycyA9IHN0cmluZ1RvVmVyc2lvbihrZXkpO1xyXG4gICAgICAgICAgICB2YXIgZmlsZW5hbWUgPSBkZXNjVmVyc2lvbnNba2V5XTtcclxuICAgICAgICAgICAgaWYgKGZpbGVuYW1lIGluIGRlc2NSZXZlcnNlTWFwKSB7XHJcbiAgICAgICAgICAgICAgICBjb3B5SGFuZGxlcih2ZXJzLCBkZXNjUmV2ZXJzZU1hcFtmaWxlbmFtZV0pXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlbmFtZSA9IGRlc2NWZXJzaW9uc1trZXldO1xyXG4gICAgICAgICAgICAgICAgYWRkSGFuZGxlcih2ZXJzLCBkZXNjRmlsZXNbZmlsZW5hbWVdLCBkZXNjRmlsZXNbZmlsZW5hbWUgKyAnLmpzb24nXSk7XHJcbiAgICAgICAgICAgICAgICBkZXNjUmV2ZXJzZU1hcFtmaWxlbmFtZV0gPSB2ZXJzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUZpZWxkcyh0YXJnZXQsIHNvdXJjZSkge1xyXG4gICAgICAgICAgICAvLyBIYW5kbGUgYXJyYXlzXHJcbiAgICAgICAgICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVwZGF0ZUZpZWxkc0FycmF5KHRhcmdldCwgc291cmNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBIYW5kbGUgb2JqZWN0c1xyXG4gICAgICAgICAgICBpZiAoc291cmNlIGluc3RhbmNlb2YgT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXBkYXRlRmllbGRzT2JqZWN0KHRhcmdldCwgc291cmNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBIYW5kbGUgYm9vbHMsIHRyZWF0aW5nIGJvdGggZmFsc2UgYW5kIG1pc3NpbmcgZmllbGRzIGFzIGZhbHNlXHJcbiAgICAgICAgICAgIGlmICh0YXJnZXQgPT09IHRydWUgJiYgIXNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIElmIG5ldyBkYXRhIGlzIG1pc3NpbmcsIHVzZSB0aGUgb2xkIGRhdGFcclxuICAgICAgICAgICAgaWYgKHNvdXJjZSA9PT0gbnVsbCB8fCBzb3VyY2UgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc291cmNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlRmllbGRzT2JqZWN0KHRhcmdldCwgc291cmNlKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXModGFyZ2V0KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdXBkYXRlRmllbGRzKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGtleSBpbiByZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHVwZGF0ZUZpZWxkcyh0YXJnZXRba2V5XSwgc291cmNlW2tleV0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUZpZWxkc0FycmF5KHRhcmdldCwgc291cmNlKSB7XHJcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBNYXRoLm1heCh0YXJnZXQubGVuZ3RoLCBzb3VyY2UubGVuZ3RoKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBsZW5ndGg7ICsraWR4KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh1cGRhdGVGaWVsZHModGFyZ2V0W2lkeF0sIHNvdXJjZVtpZHhdKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIFNlcmlhbGl6ZXI6IEZseWJyaXhTZXJpYWxpemF0aW9uLlNlcmlhbGl6ZXIsXHJcbiAgICAgICAgICAgIGdldERlZmF1bHRzOiBmdW5jdGlvbiAoZmlybXdhcmUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0c0NhY2hlW2Zpcm13YXJlXTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0SGFuZGxlcjogZnVuY3Rpb24gKGZpcm13YXJlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlckNhY2hlW2Zpcm13YXJlXTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0TmV3ZXN0VmVyc2lvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ld2VzdFZlcnNpb247XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFkZEhhbmRsZXI6IGFkZEhhbmRsZXIsXHJcbiAgICAgICAgICAgIGNvcHlIYW5kbGVyOiBjb3B5SGFuZGxlcixcclxuICAgICAgICAgICAgdXBkYXRlRmllbGRzOiB1cGRhdGVGaWVsZHMsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0oKSk7XHJcbiJdfQ==
