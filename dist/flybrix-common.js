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

        constants['LED_unused_mode'] = '{status:{},pattern:' + constants.PATTERN_none + ',colors:' + constants.COLOR_Black + 'indicator_red:false,indicator_green:false}';

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
        var currentSerializationHandler = defaultSerializationHandler;

        return {
            set: function(value) {
                version = value;
                key = value.join('.');
                currentSerializationHandler =
                    serializationHandler.getHandler(desiredKey) || defaultSerializationHandler;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImRlc2NyaXB0b3JzLmpzIiwiY2FsaWJyYXRpb24uanMiLCJjb2JzLmpzIiwiY29tbWFuZExvZy5qcyIsImRldmljZUNvbmZpZy5qcyIsImRldmljZUNvbmZpZ1BhcnNlci5qcyIsImZpcm13YXJlVmVyc2lvbi5qcyIsImxlZC5qcyIsInJjRGF0YS5qcyIsInNlcmlhbC5qcyIsInNlcmlhbGl6YXRpb25IYW5kbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJmbHlicml4LWNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicsIFtdKTtcclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgZGVzY3JpcHRvcnNIYW5kbGVyLiRpbmplY3QgPSBbXTtcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2Rlc2NyaXB0b3JzSGFuZGxlcicsIGRlc2NyaXB0b3JzSGFuZGxlcik7XG4gICAgZnVuY3Rpb24gZGVzY3JpcHRvcnNIYW5kbGVyKCkge1xuICAgICAgICB2YXIgdmVyc2lvbnMgPSB7XCIxLjQuMFwiOlwiMS40LnR4dFwiLFwiMS41LjBcIjpcIjEuNS50eHRcIixcIjEuNS4xXCI6XCIxLjUudHh0XCIsXCIxLjYuMFwiOlwiMS42LnR4dFwiLFwiMS43LjBcIjpcIjEuNy50eHRcIn07XG4gICAgICAgIHZhciBmaWxlcyA9IHtcIjEuNC50eHRcIjpcIlZlY3RvcjNmPXt4OmYzMix5OmYzMix6OmYzMn07UElEU2V0dGluZ3M9e2twOmYzMixraTpmMzIsa2Q6ZjMyLGludGVncmFsX3dpbmR1cF9ndWFyZDpmMzIsZF9maWx0ZXJfdGltZTpmMzIsc2V0cG9pbnRfZmlsdGVyX3RpbWU6ZjMyLGNvbW1hbmRfdG9fdmFsdWU6ZjMyfTtWZXJzaW9uPXttYWpvcjp1OCxtaW5vcjp1OCxwYXRjaDp1OH07Q29uZmlnSUQ9dTMyO1BjYlRyYW5zZm9ybT17b3JpZW50YXRpb246VmVjdG9yM2YsdHJhbnNsYXRpb246VmVjdG9yM2Z9O01peFRhYmxlPXtmejpbaTg6OF0sdHg6W2k4OjhdLHR5OltpODo4XSx0ejpbaTg6OF19O01hZ0JpYXM9e29mZnNldDpWZWN0b3IzZn07Q2hhbm5lbFByb3BlcnRpZXM9e2Fzc2lnbm1lbnQ6e3RocnVzdDp1OCxwaXRjaDp1OCxyb2xsOnU4LHlhdzp1OCxhdXgxOnU4LGF1eDI6dTh9LGludmVyc2lvbjp7LzgvdGhydXN0OnZvaWQscGl0Y2g6dm9pZCxyb2xsOnZvaWQseWF3OnZvaWQsYXV4MTp2b2lkLGF1eDI6dm9pZH0sbWlkcG9pbnQ6W3UxNjo2XSxkZWFkem9uZTpbdTE2OjZdfTtQSURCeXBhc3M9ey84L3RocnVzdF9tYXN0ZXI6dm9pZCxwaXRjaF9tYXN0ZXI6dm9pZCxyb2xsX21hc3Rlcjp2b2lkLHlhd19tYXN0ZXI6dm9pZCx0aHJ1c3Rfc2xhdmU6dm9pZCxwaXRjaF9zbGF2ZTp2b2lkLHJvbGxfc2xhdmU6dm9pZCx5YXdfc2xhdmU6dm9pZH07UElEUGFyYW1ldGVycz17dGhydXN0X21hc3RlcjpQSURTZXR0aW5ncyxwaXRjaF9tYXN0ZXI6UElEU2V0dGluZ3Mscm9sbF9tYXN0ZXI6UElEU2V0dGluZ3MseWF3X21hc3RlcjpQSURTZXR0aW5ncyx0aHJ1c3Rfc2xhdmU6UElEU2V0dGluZ3MscGl0Y2hfc2xhdmU6UElEU2V0dGluZ3Mscm9sbF9zbGF2ZTpQSURTZXR0aW5ncyx5YXdfc2xhdmU6UElEU2V0dGluZ3MscGlkX2J5cGFzczpQSURCeXBhc3N9O1N0YXRlUGFyYW1ldGVycz17c3RhdGVfZXN0aW1hdGlvbjpbZjMyOjJdLGVuYWJsZTpbZjMyOjJdfTtTdGF0dXNGbGFnPXsvMTYvYm9vdDp2b2lkLG1wdV9mYWlsOnZvaWQsYm1wX2ZhaWw6dm9pZCxyeF9mYWlsOnZvaWQsaWRsZTp2b2lkLGVuYWJsaW5nOnZvaWQsY2xlYXJfbXB1X2JpYXM6dm9pZCxzZXRfbXB1X2JpYXM6dm9pZCxmYWlsX3N0YWJpbGl0eTp2b2lkLGZhaWxfYW5nbGU6dm9pZCxlbmFibGVkOnZvaWQsYmF0dGVyeV9sb3c6dm9pZCx0ZW1wX3dhcm5pbmc6dm9pZCxsb2dfZnVsbDp2b2lkLGZhaWxfb3RoZXI6dm9pZCxvdmVycmlkZTp2b2lkfTtDb2xvcj17cmVkOnU4LGdyZWVuOnU4LGJsdWU6dTh9O0xFRFN0YXRlQ29sb3JzPXtyaWdodF9mcm9udDpDb2xvcixyaWdodF9iYWNrOkNvbG9yLGxlZnRfZnJvbnQ6Q29sb3IsbGVmdF9iYWNrOkNvbG9yfTtMRURTdGF0ZUNhc2U9e3N0YXR1czpTdGF0dXNGbGFnLHBhdHRlcm46dTgsY29sb3JzOkxFRFN0YXRlQ29sb3JzLGluZGljYXRvcl9yZWQ6Ym9vbCxpbmRpY2F0b3JfZ3JlZW46Ym9vbH07TEVEU3RhdGVzPVsvMTYvTEVEU3RhdGVDYXNlOjE2XTtMRURTdGF0ZXNGaXhlZD1bTEVEU3RhdGVDYXNlOjE2XTtEZXZpY2VOYW1lPXM5O0NvbmZpZ3VyYXRpb249ey8xNi92ZXJzaW9uOlZlcnNpb24saWQ6Q29uZmlnSUQscGNiX3RyYW5zZm9ybTpQY2JUcmFuc2Zvcm0sbWl4X3RhYmxlOk1peFRhYmxlLG1hZ19iaWFzOk1hZ0JpYXMsY2hhbm5lbDpDaGFubmVsUHJvcGVydGllcyxwaWRfcGFyYW1ldGVyczpQSURQYXJhbWV0ZXJzLHN0YXRlX3BhcmFtZXRlcnM6U3RhdGVQYXJhbWV0ZXJzLGxlZF9zdGF0ZXM6TEVEU3RhdGVzLG5hbWU6RGV2aWNlTmFtZX07Q29uZmlndXJhdGlvbkZpeGVkPXt2ZXJzaW9uOlZlcnNpb24saWQ6Q29uZmlnSUQscGNiX3RyYW5zZm9ybTpQY2JUcmFuc2Zvcm0sbWl4X3RhYmxlOk1peFRhYmxlLG1hZ19iaWFzOk1hZ0JpYXMsY2hhbm5lbDpDaGFubmVsUHJvcGVydGllcyxwaWRfcGFyYW1ldGVyczpQSURQYXJhbWV0ZXJzLHN0YXRlX3BhcmFtZXRlcnM6U3RhdGVQYXJhbWV0ZXJzLGxlZF9zdGF0ZXM6TEVEU3RhdGVzRml4ZWQsbmFtZTpEZXZpY2VOYW1lfTtDb25maWd1cmF0aW9uRmxhZz17LzE2L3ZlcnNpb246dm9pZCxpZDp2b2lkLHBjYl90cmFuc2Zvcm06dm9pZCxtaXhfdGFibGU6dm9pZCxtYWdfYmlhczp2b2lkLGNoYW5uZWw6dm9pZCxwaWRfcGFyYW1ldGVyczp2b2lkLHN0YXRlX3BhcmFtZXRlcnM6dm9pZCxsZWRfc3RhdGVzOlsvL3ZvaWQ6MTZdLG5hbWU6dm9pZH07Um90YXRpb249e3BpdGNoOmYzMixyb2xsOmYzMix5YXc6ZjMyfTtQSURTdGF0ZT17dGltZXN0YW1wX3VzOnUzMixpbnB1dDpmMzIsc2V0cG9pbnQ6ZjMyLHBfdGVybTpmMzIsaV90ZXJtOmYzMixkX3Rlcm06ZjMyfTtSY0NvbW1hbmQ9e3Rocm90dGxlOmkxNixwaXRjaDppMTYscm9sbDppMTYseWF3OmkxNn07U3RhdGU9ey8zMi90aW1lc3RhbXBfdXM6dTMyLHN0YXR1czpTdGF0dXNGbGFnLHYwX3Jhdzp1MTYsaTBfcmF3OnUxNixpMV9yYXc6dTE2LGFjY2VsOlZlY3RvcjNmLGd5cm86VmVjdG9yM2YsbWFnOlZlY3RvcjNmLHRlbXBlcmF0dXJlOnUxNixwcmVzc3VyZTp1MzIscHBtOltpMTY6Nl0sYXV4X2NoYW5fbWFzazp1OCxjb21tYW5kOlJjQ29tbWFuZCxjb250cm9sOntmejpmMzIsdHg6ZjMyLHR5OmYzMix0ejpmMzJ9LHBpZF9tYXN0ZXJfZno6UElEU3RhdGUscGlkX21hc3Rlcl90eDpQSURTdGF0ZSxwaWRfbWFzdGVyX3R5OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHo6UElEU3RhdGUscGlkX3NsYXZlX2Z6OlBJRFN0YXRlLHBpZF9zbGF2ZV90eDpQSURTdGF0ZSxwaWRfc2xhdmVfdHk6UElEU3RhdGUscGlkX3NsYXZlX3R6OlBJRFN0YXRlLG1vdG9yX291dDpbaTE2OjhdLGtpbmVtYXRpY3NfYW5nbGU6Um90YXRpb24sa2luZW1hdGljc19yYXRlOlJvdGF0aW9uLGtpbmVtYXRpY3NfYWx0aXR1ZGU6ZjMyLGxvb3BfY291bnQ6dTMyfTtTdGF0ZUZpZWxkcz17LzMyL3RpbWVzdGFtcF91czp2b2lkLHN0YXR1czp2b2lkLHYwX3Jhdzp2b2lkLGkwX3Jhdzp2b2lkLGkxX3Jhdzp2b2lkLGFjY2VsOnZvaWQsZ3lybzp2b2lkLG1hZzp2b2lkLHRlbXBlcmF0dXJlOnZvaWQscHJlc3N1cmU6dm9pZCxwcG06dm9pZCxhdXhfY2hhbl9tYXNrOnZvaWQsY29tbWFuZDp2b2lkLGNvbnRyb2w6dm9pZCxwaWRfbWFzdGVyX2Z6OnZvaWQscGlkX21hc3Rlcl90eDp2b2lkLHBpZF9tYXN0ZXJfdHk6dm9pZCxwaWRfbWFzdGVyX3R6OnZvaWQscGlkX3NsYXZlX2Z6OnZvaWQscGlkX3NsYXZlX3R4OnZvaWQscGlkX3NsYXZlX3R5OnZvaWQscGlkX3NsYXZlX3R6OnZvaWQsbW90b3Jfb3V0OnZvaWQsa2luZW1hdGljc19hbmdsZTp2b2lkLGtpbmVtYXRpY3NfcmF0ZTp2b2lkLGtpbmVtYXRpY3NfYWx0aXR1ZGU6dm9pZCxsb29wX2NvdW50OnZvaWR9O0F1eE1hc2s9ey8vYXV4MV9sb3c6dm9pZCxhdXgxX21pZDp2b2lkLGF1eDFfaGlnaDp2b2lkLGF1eDJfbG93OnZvaWQsYXV4Ml9taWQ6dm9pZCxhdXgyX2hpZ2g6dm9pZH07Q29tbWFuZD17LzMyL3JlcXVlc3RfcmVzcG9uc2U6dm9pZCxzZXRfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZpeGVkLHJlaW5pdF9lZXByb21fZGF0YTp2b2lkLHJlcXVlc3RfZWVwcm9tX2RhdGE6dm9pZCxyZXF1ZXN0X2VuYWJsZV9pdGVyYXRpb246dTgsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMDp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMTp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMjp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMzp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNDp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNTp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNjp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNzp1MTYsc2V0X2NvbW1hbmRfb3ZlcnJpZGU6Ym9vbCxzZXRfc3RhdGVfbWFzazpTdGF0ZUZpZWxkcyxzZXRfc3RhdGVfZGVsYXk6dTE2LHNldF9zZF93cml0ZV9kZWxheTp1MTYsc2V0X2xlZDp7cGF0dGVybjp1OCxjb2xvcl9yaWdodDpDb2xvcixjb2xvcl9sZWZ0OkNvbG9yLGluZGljYXRvcl9yZWQ6Ym9vbCxpbmRpY2F0b3JfZ3JlZW46Ym9vbH0sc2V0X3NlcmlhbF9yYzp7ZW5hYmxlZDpib29sLGNvbW1hbmQ6UmNDb21tYW5kLGF1eF9tYXNrOkF1eE1hc2t9LHNldF9jYXJkX3JlY29yZGluZ19zdGF0ZTp7LzgvcmVjb3JkX3RvX2NhcmQ6dm9pZCxsb2NrX3JlY29yZGluZ19zdGF0ZTp2b2lkfSxzZXRfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uLHJlaW5pdF9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GbGFnLHJlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GbGFnLHJlcV9jYXJkX3JlY29yZGluZ19zdGF0ZTp2b2lkLHNldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWc6Q29uZmlndXJhdGlvbixzZXRfY29tbWFuZF9zb3VyY2VzOnsvOC9zZXJpYWw6dm9pZCxyYWRpbzp2b2lkfSxzZXRfY2FsaWJyYXRpb246e2VuYWJsZWQ6Ym9vbCxtb2RlOnU4fSxzZXRfYXV0b3BpbG90X2VuYWJsZWQ6Ym9vbCxzZXRfdXNiX21vZGU6dTh9O0RlYnVnU3RyaW5nPXtkZXByZWNhdGVkX21hc2s6dTMyLG1lc3NhZ2U6c307SGlzdG9yeURhdGE9RGVidWdTdHJpbmc7UmVzcG9uc2U9e21hc2s6dTMyLGFjazp1MzJ9O1wiLFwiMS40LnR4dC5qc29uXCI6XCJ7XFxcInZlcnNpb25cXFwiOntcXFwibWFqb3JcXFwiOjEsXFxcIm1pbm9yXFxcIjo0LFxcXCJwYXRjaFxcXCI6MH0sXFxcImlkXFxcIjowLFxcXCJwY2JfdHJhbnNmb3JtXFxcIjp7XFxcIm9yaWVudGF0aW9uXFxcIjp7XFxcInhcXFwiOjAsXFxcInlcXFwiOjAsXFxcInpcXFwiOjB9LFxcXCJ0cmFuc2xhdGlvblxcXCI6e1xcXCJ4XFxcIjowLFxcXCJ5XFxcIjowLFxcXCJ6XFxcIjowfX0sXFxcIm1peF90YWJsZVxcXCI6e1xcXCJmelxcXCI6WzEsMSwxLDEsMSwxLDEsMV0sXFxcInR4XFxcIjpbMSwxLDEsMSwtMSwtMSwtMSwtMV0sXFxcInR5XFxcIjpbLTEsMSwtMSwxLC0xLDEsLTEsMV0sXFxcInR6XFxcIjpbMSwtMSwtMSwxLDEsLTEsLTEsMV19LFxcXCJtYWdfYmlhc1xcXCI6e1xcXCJvZmZzZXRcXFwiOntcXFwieFxcXCI6MCxcXFwieVxcXCI6MCxcXFwielxcXCI6MH19LFxcXCJjaGFubmVsXFxcIjp7XFxcImFzc2lnbm1lbnRcXFwiOntcXFwidGhydXN0XFxcIjoyLFxcXCJwaXRjaFxcXCI6MSxcXFwicm9sbFxcXCI6MCxcXFwieWF3XFxcIjozLFxcXCJhdXgxXFxcIjo0LFxcXCJhdXgyXFxcIjo1fSxcXFwiaW52ZXJzaW9uXFxcIjp7XFxcInRocnVzdFxcXCI6bnVsbCxcXFwicGl0Y2hcXFwiOnRydWUsXFxcInJvbGxcXFwiOnRydWUsXFxcInlhd1xcXCI6bnVsbCxcXFwiYXV4MVxcXCI6bnVsbCxcXFwiYXV4MlxcXCI6bnVsbH0sXFxcIm1pZHBvaW50XFxcIjpbMTUwMCwxNTAwLDE1MDAsMTUwMCwxNTAwLDE1MDBdLFxcXCJkZWFkem9uZVxcXCI6WzAsMCwwLDIwLDAsMF19LFxcXCJwaWRfcGFyYW1ldGVyc1xcXCI6e1xcXCJ0aHJ1c3RfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjoxLjAsXFxcImtpXFxcIjowLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxLjB9LFxcXCJwaXRjaF9tYXN0ZXJcXFwiOntcXFwia3BcXFwiOjMuNSxcXFwia2lcXFwiOjAuNSxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MzAuMH0sXFxcInJvbGxfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjozLjUsXFxcImtpXFxcIjowLjUsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAwLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjMwLjB9LFxcXCJ5YXdfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjoxLjAsXFxcImtpXFxcIjowLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxODAuMH0sXFxcInRocnVzdF9zbGF2ZVxcXCI6e1xcXCJrcFxcXCI6MS4wLFxcXCJraVxcXCI6MC4wLFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MS4wfSxcXFwicGl0Y2hfc2xhdmVcXFwiOntcXFwia3BcXFwiOjUuMCxcXFwia2lcXFwiOjIuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MTUwLjB9LFxcXCJyb2xsX3NsYXZlXFxcIjp7XFxcImtwXFxcIjo1LjAsXFxcImtpXFxcIjoyLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAwLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjE1MC4wfSxcXFwieWF3X3NsYXZlXFxcIjp7XFxcImtwXFxcIjo0MC4wLFxcXCJraVxcXCI6MTAuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MjQwLjB9LFxcXCJwaWRfYnlwYXNzXFxcIjp7XFxcInRocnVzdF9tYXN0ZXJcXFwiOnRydWUsXFxcInBpdGNoX21hc3RlclxcXCI6bnVsbCxcXFwicm9sbF9tYXN0ZXJcXFwiOm51bGwsXFxcInlhd19tYXN0ZXJcXFwiOnRydWUsXFxcInRocnVzdF9zbGF2ZVxcXCI6dHJ1ZSxcXFwicGl0Y2hfc2xhdmVcXFwiOm51bGwsXFxcInJvbGxfc2xhdmVcXFwiOm51bGwsXFxcInlhd19zbGF2ZVxcXCI6bnVsbH19LFxcXCJzdGF0ZV9wYXJhbWV0ZXJzXFxcIjp7XFxcInN0YXRlX2VzdGltYXRpb25cXFwiOlsxLDAuMDFdLFxcXCJlbmFibGVcXFwiOlswLjAwMSwzMF19LFxcXCJsZWRfc3RhdGVzXFxcIjpbe1xcXCJzdGF0dXNcXFwiOntcXFwiY3Jhc2hfZGV0ZWN0ZWRcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX2ZsYXNofVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfT3JhbmdlfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJsb29wX3Nsb3dcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX3NvbGlkfVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfUmVkfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJvdmVycmlkZVxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fc29saWR9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9MaWdodFNlYUdyZWVufVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJsb2dfZnVsbFxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fZmxhc2h9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9PcmFuZ2V9XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LHtcXFwic3RhdHVzXFxcIjp7XFxcIm5vX3NpZ25hbFxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fZmxhc2h9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9HcmVlbn1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwiYXJtaW5nXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9mbGFzaH1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX0JsdWV9XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LHtcXFwic3RhdHVzXFxcIjp7XFxcImFybWVkXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9iZWFjb259XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9CbHVlfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJpZGxlXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9icmVhdGhlfVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfR3JlZW59XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiXSxcXFwibmFtZVxcXCI6XFxcIkZMWUJSSVhcXFwifVwiLFwiMS41LnR4dFwiOlwiVmVjdG9yM2Y9e3g6ZjMyLHk6ZjMyLHo6ZjMyfTtQSURTZXR0aW5ncz17a3A6ZjMyLGtpOmYzMixrZDpmMzIsaW50ZWdyYWxfd2luZHVwX2d1YXJkOmYzMixkX2ZpbHRlcl90aW1lOmYzMixzZXRwb2ludF9maWx0ZXJfdGltZTpmMzIsY29tbWFuZF90b192YWx1ZTpmMzJ9O1ZlcnNpb249e21ham9yOnU4LG1pbm9yOnU4LHBhdGNoOnU4fTtDb25maWdJRD11MzI7UGNiVHJhbnNmb3JtPXtvcmllbnRhdGlvbjpWZWN0b3IzZix0cmFuc2xhdGlvbjpWZWN0b3IzZn07TWl4VGFibGU9e2Z6OltpODo4XSx0eDpbaTg6OF0sdHk6W2k4OjhdLHR6OltpODo4XX07TWFnQmlhcz17b2Zmc2V0OlZlY3RvcjNmfTtDaGFubmVsUHJvcGVydGllcz17YXNzaWdubWVudDp7dGhydXN0OnU4LHBpdGNoOnU4LHJvbGw6dTgseWF3OnU4LGF1eDE6dTgsYXV4Mjp1OH0saW52ZXJzaW9uOnsvOC90aHJ1c3Q6dm9pZCxwaXRjaDp2b2lkLHJvbGw6dm9pZCx5YXc6dm9pZCxhdXgxOnZvaWQsYXV4Mjp2b2lkfSxtaWRwb2ludDpbdTE2OjZdLGRlYWR6b25lOlt1MTY6Nl19O1BJREJ5cGFzcz17LzgvdGhydXN0X21hc3Rlcjp2b2lkLHBpdGNoX21hc3Rlcjp2b2lkLHJvbGxfbWFzdGVyOnZvaWQseWF3X21hc3Rlcjp2b2lkLHRocnVzdF9zbGF2ZTp2b2lkLHBpdGNoX3NsYXZlOnZvaWQscm9sbF9zbGF2ZTp2b2lkLHlhd19zbGF2ZTp2b2lkfTtQSURQYXJhbWV0ZXJzPXt0aHJ1c3RfbWFzdGVyOlBJRFNldHRpbmdzLHBpdGNoX21hc3RlcjpQSURTZXR0aW5ncyxyb2xsX21hc3RlcjpQSURTZXR0aW5ncyx5YXdfbWFzdGVyOlBJRFNldHRpbmdzLHRocnVzdF9zbGF2ZTpQSURTZXR0aW5ncyxwaXRjaF9zbGF2ZTpQSURTZXR0aW5ncyxyb2xsX3NsYXZlOlBJRFNldHRpbmdzLHlhd19zbGF2ZTpQSURTZXR0aW5ncyx0aHJ1c3RfZ2FpbjpmMzIscGl0Y2hfZ2FpbjpmMzIscm9sbF9nYWluOmYzMix5YXdfZ2FpbjpmMzIscGlkX2J5cGFzczpQSURCeXBhc3N9O1N0YXRlUGFyYW1ldGVycz17c3RhdGVfZXN0aW1hdGlvbjpbZjMyOjJdLGVuYWJsZTpbZjMyOjJdfTtTdGF0dXNGbGFnPXsvMTYvYm9vdDp2b2lkLG1wdV9mYWlsOnZvaWQsYm1wX2ZhaWw6dm9pZCxyeF9mYWlsOnZvaWQsaWRsZTp2b2lkLGVuYWJsaW5nOnZvaWQsY2xlYXJfbXB1X2JpYXM6dm9pZCxzZXRfbXB1X2JpYXM6dm9pZCxmYWlsX3N0YWJpbGl0eTp2b2lkLGZhaWxfYW5nbGU6dm9pZCxlbmFibGVkOnZvaWQsYmF0dGVyeV9sb3c6dm9pZCx0ZW1wX3dhcm5pbmc6dm9pZCxsb2dfZnVsbDp2b2lkLGZhaWxfb3RoZXI6dm9pZCxvdmVycmlkZTp2b2lkfTtDb2xvcj17cmVkOnU4LGdyZWVuOnU4LGJsdWU6dTh9O0xFRFN0YXRlQ29sb3JzPXtyaWdodF9mcm9udDpDb2xvcixyaWdodF9iYWNrOkNvbG9yLGxlZnRfZnJvbnQ6Q29sb3IsbGVmdF9iYWNrOkNvbG9yfTtMRURTdGF0ZUNhc2U9e3N0YXR1czpTdGF0dXNGbGFnLHBhdHRlcm46dTgsY29sb3JzOkxFRFN0YXRlQ29sb3JzLGluZGljYXRvcl9yZWQ6Ym9vbCxpbmRpY2F0b3JfZ3JlZW46Ym9vbH07TEVEU3RhdGVzPVsvMTYvTEVEU3RhdGVDYXNlOjE2XTtMRURTdGF0ZXNGaXhlZD1bTEVEU3RhdGVDYXNlOjE2XTtEZXZpY2VOYW1lPXM5O0NvbmZpZ3VyYXRpb249ey8xNi92ZXJzaW9uOlZlcnNpb24saWQ6Q29uZmlnSUQscGNiX3RyYW5zZm9ybTpQY2JUcmFuc2Zvcm0sbWl4X3RhYmxlOk1peFRhYmxlLG1hZ19iaWFzOk1hZ0JpYXMsY2hhbm5lbDpDaGFubmVsUHJvcGVydGllcyxwaWRfcGFyYW1ldGVyczpQSURQYXJhbWV0ZXJzLHN0YXRlX3BhcmFtZXRlcnM6U3RhdGVQYXJhbWV0ZXJzLGxlZF9zdGF0ZXM6TEVEU3RhdGVzLG5hbWU6RGV2aWNlTmFtZX07Q29uZmlndXJhdGlvbkZpeGVkPXt2ZXJzaW9uOlZlcnNpb24saWQ6Q29uZmlnSUQscGNiX3RyYW5zZm9ybTpQY2JUcmFuc2Zvcm0sbWl4X3RhYmxlOk1peFRhYmxlLG1hZ19iaWFzOk1hZ0JpYXMsY2hhbm5lbDpDaGFubmVsUHJvcGVydGllcyxwaWRfcGFyYW1ldGVyczpQSURQYXJhbWV0ZXJzLHN0YXRlX3BhcmFtZXRlcnM6U3RhdGVQYXJhbWV0ZXJzLGxlZF9zdGF0ZXM6TEVEU3RhdGVzRml4ZWQsbmFtZTpEZXZpY2VOYW1lfTtDb25maWd1cmF0aW9uRmxhZz17LzE2L3ZlcnNpb246dm9pZCxpZDp2b2lkLHBjYl90cmFuc2Zvcm06dm9pZCxtaXhfdGFibGU6dm9pZCxtYWdfYmlhczp2b2lkLGNoYW5uZWw6dm9pZCxwaWRfcGFyYW1ldGVyczp2b2lkLHN0YXRlX3BhcmFtZXRlcnM6dm9pZCxsZWRfc3RhdGVzOlsvL3ZvaWQ6MTZdLG5hbWU6dm9pZCx2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczp2b2lkLGluZXJ0aWFsX2JpYXM6dm9pZH07Um90YXRpb249e3BpdGNoOmYzMixyb2xsOmYzMix5YXc6ZjMyfTtQSURTdGF0ZT17dGltZXN0YW1wX3VzOnUzMixpbnB1dDpmMzIsc2V0cG9pbnQ6ZjMyLHBfdGVybTpmMzIsaV90ZXJtOmYzMixkX3Rlcm06ZjMyfTtSY0NvbW1hbmQ9e3Rocm90dGxlOmkxNixwaXRjaDppMTYscm9sbDppMTYseWF3OmkxNn07U3RhdGU9ey8zMi90aW1lc3RhbXBfdXM6dTMyLHN0YXR1czpTdGF0dXNGbGFnLHYwX3Jhdzp1MTYsaTBfcmF3OnUxNixpMV9yYXc6dTE2LGFjY2VsOlZlY3RvcjNmLGd5cm86VmVjdG9yM2YsbWFnOlZlY3RvcjNmLHRlbXBlcmF0dXJlOnUxNixwcmVzc3VyZTp1MzIscHBtOltpMTY6Nl0sYXV4X2NoYW5fbWFzazp1OCxjb21tYW5kOlJjQ29tbWFuZCxjb250cm9sOntmejpmMzIsdHg6ZjMyLHR5OmYzMix0ejpmMzJ9LHBpZF9tYXN0ZXJfZno6UElEU3RhdGUscGlkX21hc3Rlcl90eDpQSURTdGF0ZSxwaWRfbWFzdGVyX3R5OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHo6UElEU3RhdGUscGlkX3NsYXZlX2Z6OlBJRFN0YXRlLHBpZF9zbGF2ZV90eDpQSURTdGF0ZSxwaWRfc2xhdmVfdHk6UElEU3RhdGUscGlkX3NsYXZlX3R6OlBJRFN0YXRlLG1vdG9yX291dDpbaTE2OjhdLGtpbmVtYXRpY3NfYW5nbGU6Um90YXRpb24sa2luZW1hdGljc19yYXRlOlJvdGF0aW9uLGtpbmVtYXRpY3NfYWx0aXR1ZGU6ZjMyLGxvb3BfY291bnQ6dTMyfTtTdGF0ZUZpZWxkcz17LzMyL3RpbWVzdGFtcF91czp2b2lkLHN0YXR1czp2b2lkLHYwX3Jhdzp2b2lkLGkwX3Jhdzp2b2lkLGkxX3Jhdzp2b2lkLGFjY2VsOnZvaWQsZ3lybzp2b2lkLG1hZzp2b2lkLHRlbXBlcmF0dXJlOnZvaWQscHJlc3N1cmU6dm9pZCxwcG06dm9pZCxhdXhfY2hhbl9tYXNrOnZvaWQsY29tbWFuZDp2b2lkLGNvbnRyb2w6dm9pZCxwaWRfbWFzdGVyX2Z6OnZvaWQscGlkX21hc3Rlcl90eDp2b2lkLHBpZF9tYXN0ZXJfdHk6dm9pZCxwaWRfbWFzdGVyX3R6OnZvaWQscGlkX3NsYXZlX2Z6OnZvaWQscGlkX3NsYXZlX3R4OnZvaWQscGlkX3NsYXZlX3R5OnZvaWQscGlkX3NsYXZlX3R6OnZvaWQsbW90b3Jfb3V0OnZvaWQsa2luZW1hdGljc19hbmdsZTp2b2lkLGtpbmVtYXRpY3NfcmF0ZTp2b2lkLGtpbmVtYXRpY3NfYWx0aXR1ZGU6dm9pZCxsb29wX2NvdW50OnZvaWR9O0F1eE1hc2s9ey8vYXV4MV9sb3c6dm9pZCxhdXgxX21pZDp2b2lkLGF1eDFfaGlnaDp2b2lkLGF1eDJfbG93OnZvaWQsYXV4Ml9taWQ6dm9pZCxhdXgyX2hpZ2g6dm9pZH07Q29tbWFuZD17LzMyL3JlcXVlc3RfcmVzcG9uc2U6dm9pZCxzZXRfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZpeGVkLHJlaW5pdF9lZXByb21fZGF0YTp2b2lkLHJlcXVlc3RfZWVwcm9tX2RhdGE6dm9pZCxyZXF1ZXN0X2VuYWJsZV9pdGVyYXRpb246dTgsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMDp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMTp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMjp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMzp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNDp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNTp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNjp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNzp1MTYsc2V0X2NvbW1hbmRfb3ZlcnJpZGU6Ym9vbCxzZXRfc3RhdGVfbWFzazpTdGF0ZUZpZWxkcyxzZXRfc3RhdGVfZGVsYXk6dTE2LHNldF9zZF93cml0ZV9kZWxheTp1MTYsc2V0X2xlZDp7cGF0dGVybjp1OCxjb2xvcl9yaWdodDpDb2xvcixjb2xvcl9sZWZ0OkNvbG9yLGluZGljYXRvcl9yZWQ6Ym9vbCxpbmRpY2F0b3JfZ3JlZW46Ym9vbH0sc2V0X3NlcmlhbF9yYzp7ZW5hYmxlZDpib29sLGNvbW1hbmQ6UmNDb21tYW5kLGF1eF9tYXNrOkF1eE1hc2t9LHNldF9jYXJkX3JlY29yZGluZ19zdGF0ZTp7LzgvcmVjb3JkX3RvX2NhcmQ6dm9pZCxsb2NrX3JlY29yZGluZ19zdGF0ZTp2b2lkfSxzZXRfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uLHJlaW5pdF9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GbGFnLHJlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GbGFnLHJlcV9jYXJkX3JlY29yZGluZ19zdGF0ZTp2b2lkLHNldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWc6Q29uZmlndXJhdGlvbixzZXRfY29tbWFuZF9zb3VyY2VzOnsvOC9zZXJpYWw6dm9pZCxyYWRpbzp2b2lkfSxzZXRfY2FsaWJyYXRpb246e2VuYWJsZWQ6Ym9vbCxtb2RlOnU4fSxzZXRfYXV0b3BpbG90X2VuYWJsZWQ6Ym9vbCxzZXRfdXNiX21vZGU6dTh9O0RlYnVnU3RyaW5nPXtkZXByZWNhdGVkX21hc2s6dTMyLG1lc3NhZ2U6c307SGlzdG9yeURhdGE9RGVidWdTdHJpbmc7UmVzcG9uc2U9e21hc2s6dTMyLGFjazp1MzJ9O1wiLFwiMS41LnR4dC5qc29uXCI6XCJ7XFxcInZlcnNpb25cXFwiOntcXFwibWFqb3JcXFwiOjEsXFxcIm1pbm9yXFxcIjo1LFxcXCJwYXRjaFxcXCI6MH0sXFxcImlkXFxcIjowLFxcXCJwY2JfdHJhbnNmb3JtXFxcIjp7XFxcIm9yaWVudGF0aW9uXFxcIjp7XFxcInhcXFwiOjAsXFxcInlcXFwiOjAsXFxcInpcXFwiOjB9LFxcXCJ0cmFuc2xhdGlvblxcXCI6e1xcXCJ4XFxcIjowLFxcXCJ5XFxcIjowLFxcXCJ6XFxcIjowfX0sXFxcIm1peF90YWJsZVxcXCI6e1xcXCJmelxcXCI6WzEsMSwxLDEsMSwxLDEsMV0sXFxcInR4XFxcIjpbMSwxLDEsMSwtMSwtMSwtMSwtMV0sXFxcInR5XFxcIjpbLTEsMSwtMSwxLC0xLDEsLTEsMV0sXFxcInR6XFxcIjpbMSwtMSwtMSwxLDEsLTEsLTEsMV19LFxcXCJtYWdfYmlhc1xcXCI6e1xcXCJvZmZzZXRcXFwiOntcXFwieFxcXCI6MCxcXFwieVxcXCI6MCxcXFwielxcXCI6MH19LFxcXCJjaGFubmVsXFxcIjp7XFxcImFzc2lnbm1lbnRcXFwiOntcXFwidGhydXN0XFxcIjoyLFxcXCJwaXRjaFxcXCI6MSxcXFwicm9sbFxcXCI6MCxcXFwieWF3XFxcIjozLFxcXCJhdXgxXFxcIjo0LFxcXCJhdXgyXFxcIjo1fSxcXFwiaW52ZXJzaW9uXFxcIjp7XFxcInRocnVzdFxcXCI6bnVsbCxcXFwicGl0Y2hcXFwiOnRydWUsXFxcInJvbGxcXFwiOnRydWUsXFxcInlhd1xcXCI6bnVsbCxcXFwiYXV4MVxcXCI6bnVsbCxcXFwiYXV4MlxcXCI6bnVsbH0sXFxcIm1pZHBvaW50XFxcIjpbMTUwMCwxNTAwLDE1MDAsMTUwMCwxNTAwLDE1MDBdLFxcXCJkZWFkem9uZVxcXCI6WzAsMCwwLDIwLDAsMF19LFxcXCJwaWRfcGFyYW1ldGVyc1xcXCI6e1xcXCJ0aHJ1c3RfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjoxLjAsXFxcImtpXFxcIjowLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxLjB9LFxcXCJwaXRjaF9tYXN0ZXJcXFwiOntcXFwia3BcXFwiOjMuNSxcXFwia2lcXFwiOjAuNSxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MzAuMH0sXFxcInJvbGxfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjozLjUsXFxcImtpXFxcIjowLjUsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAwLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjMwLjB9LFxcXCJ5YXdfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjoxLjAsXFxcImtpXFxcIjowLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxODAuMH0sXFxcInRocnVzdF9zbGF2ZVxcXCI6e1xcXCJrcFxcXCI6MS4wLFxcXCJraVxcXCI6MC4wLFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MS4wfSxcXFwicGl0Y2hfc2xhdmVcXFwiOntcXFwia3BcXFwiOjUuMCxcXFwia2lcXFwiOjIuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MTUwLjB9LFxcXCJyb2xsX3NsYXZlXFxcIjp7XFxcImtwXFxcIjo1LjAsXFxcImtpXFxcIjoyLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAwLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjE1MC4wfSxcXFwieWF3X3NsYXZlXFxcIjp7XFxcImtwXFxcIjo0MC4wLFxcXCJraVxcXCI6MTAuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MjQwLjB9LFxcXCJ0aHJ1c3RfZ2FpblxcXCI6NDA5NSxcXFwicGl0Y2hfZ2FpblxcXCI6MjA0NyxcXFwicm9sbF9nYWluXFxcIjoyMDQ3LFxcXCJ5YXdfZ2FpblxcXCI6MjA0NyxcXFwicGlkX2J5cGFzc1xcXCI6e1xcXCJ0aHJ1c3RfbWFzdGVyXFxcIjp0cnVlLFxcXCJwaXRjaF9tYXN0ZXJcXFwiOm51bGwsXFxcInJvbGxfbWFzdGVyXFxcIjpudWxsLFxcXCJ5YXdfbWFzdGVyXFxcIjp0cnVlLFxcXCJ0aHJ1c3Rfc2xhdmVcXFwiOnRydWUsXFxcInBpdGNoX3NsYXZlXFxcIjpudWxsLFxcXCJyb2xsX3NsYXZlXFxcIjpudWxsLFxcXCJ5YXdfc2xhdmVcXFwiOm51bGx9fSxcXFwic3RhdGVfcGFyYW1ldGVyc1xcXCI6e1xcXCJzdGF0ZV9lc3RpbWF0aW9uXFxcIjpbMSwwLjAxXSxcXFwiZW5hYmxlXFxcIjpbMC4wMDEsMzBdfSxcXFwibGVkX3N0YXRlc1xcXCI6W3tcXFwic3RhdHVzXFxcIjp7XFxcImNyYXNoX2RldGVjdGVkXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9mbGFzaH1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX09yYW5nZX1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwibG9vcF9zbG93XFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9zb2xpZH1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX1JlZH1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwib3ZlcnJpZGVcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX3NvbGlkfVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfTGlnaHRTZWFHcmVlbn1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwibG9nX2Z1bGxcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX2ZsYXNofVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfT3JhbmdlfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJub19zaWduYWxcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX2ZsYXNofVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfR3JlZW59XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LHtcXFwic3RhdHVzXFxcIjp7XFxcImFybWluZ1xcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fZmxhc2h9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9CbHVlfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJhcm1lZFxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fYmVhY29ufVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfQmx1ZX1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwiaWRsZVxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fYnJlYXRoZX1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX0dyZWVufVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSxcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIixcXFwiJHtMRURfdW51c2VkX21vZGV9XFxcIl0sXFxcIm5hbWVcXFwiOlxcXCJGTFlCUklYXFxcIn1cIixcIjEuNi50eHRcIjpcIlZlY3RvcjNmPXt4OmYzMix5OmYzMix6OmYzMn07UElEU2V0dGluZ3M9e2twOmYzMixraTpmMzIsa2Q6ZjMyLGludGVncmFsX3dpbmR1cF9ndWFyZDpmMzIsZF9maWx0ZXJfdGltZTpmMzIsc2V0cG9pbnRfZmlsdGVyX3RpbWU6ZjMyLGNvbW1hbmRfdG9fdmFsdWU6ZjMyfTtWZXJzaW9uPXttYWpvcjp1OCxtaW5vcjp1OCxwYXRjaDp1OH07Q29uZmlnSUQ9dTMyO1BjYlRyYW5zZm9ybT17b3JpZW50YXRpb246VmVjdG9yM2YsdHJhbnNsYXRpb246VmVjdG9yM2Z9O01peFRhYmxlPXtmejpbaTg6OF0sdHg6W2k4OjhdLHR5OltpODo4XSx0ejpbaTg6OF19O01hZ0JpYXM9e29mZnNldDpWZWN0b3IzZn07Q2hhbm5lbFByb3BlcnRpZXM9e2Fzc2lnbm1lbnQ6e3RocnVzdDp1OCxwaXRjaDp1OCxyb2xsOnU4LHlhdzp1OCxhdXgxOnU4LGF1eDI6dTh9LGludmVyc2lvbjp7LzgvdGhydXN0OnZvaWQscGl0Y2g6dm9pZCxyb2xsOnZvaWQseWF3OnZvaWQsYXV4MTp2b2lkLGF1eDI6dm9pZH0sbWlkcG9pbnQ6W3UxNjo2XSxkZWFkem9uZTpbdTE2OjZdfTtQSURCeXBhc3M9ey84L3RocnVzdF9tYXN0ZXI6dm9pZCxwaXRjaF9tYXN0ZXI6dm9pZCxyb2xsX21hc3Rlcjp2b2lkLHlhd19tYXN0ZXI6dm9pZCx0aHJ1c3Rfc2xhdmU6dm9pZCxwaXRjaF9zbGF2ZTp2b2lkLHJvbGxfc2xhdmU6dm9pZCx5YXdfc2xhdmU6dm9pZH07UElEUGFyYW1ldGVycz17dGhydXN0X21hc3RlcjpQSURTZXR0aW5ncyxwaXRjaF9tYXN0ZXI6UElEU2V0dGluZ3Mscm9sbF9tYXN0ZXI6UElEU2V0dGluZ3MseWF3X21hc3RlcjpQSURTZXR0aW5ncyx0aHJ1c3Rfc2xhdmU6UElEU2V0dGluZ3MscGl0Y2hfc2xhdmU6UElEU2V0dGluZ3Mscm9sbF9zbGF2ZTpQSURTZXR0aW5ncyx5YXdfc2xhdmU6UElEU2V0dGluZ3MsdGhydXN0X2dhaW46ZjMyLHBpdGNoX2dhaW46ZjMyLHJvbGxfZ2FpbjpmMzIseWF3X2dhaW46ZjMyLHBpZF9ieXBhc3M6UElEQnlwYXNzfTtTdGF0ZVBhcmFtZXRlcnM9e3N0YXRlX2VzdGltYXRpb246W2YzMjoyXSxlbmFibGU6W2YzMjoyXX07U3RhdHVzRmxhZz17LzE2L18wOnZvaWQsXzE6dm9pZCxfMjp2b2lkLG5vX3NpZ25hbDp2b2lkLGlkbGU6dm9pZCxhcm1pbmc6dm9pZCxyZWNvcmRpbmdfc2Q6dm9pZCxfNzp2b2lkLGxvb3Bfc2xvdzp2b2lkLF85OnZvaWQsYXJtZWQ6dm9pZCxiYXR0ZXJ5X2xvdzp2b2lkLGJhdHRlcnlfY3JpdGljYWw6dm9pZCxsb2dfZnVsbDp2b2lkLGNyYXNoX2RldGVjdGVkOnZvaWQsb3ZlcnJpZGU6dm9pZH07Q29sb3I9e3JlZDp1OCxncmVlbjp1OCxibHVlOnU4fTtMRURTdGF0ZUNvbG9ycz17cmlnaHRfZnJvbnQ6Q29sb3IscmlnaHRfYmFjazpDb2xvcixsZWZ0X2Zyb250OkNvbG9yLGxlZnRfYmFjazpDb2xvcn07TEVEU3RhdGVDYXNlPXtzdGF0dXM6U3RhdHVzRmxhZyxwYXR0ZXJuOnU4LGNvbG9yczpMRURTdGF0ZUNvbG9ycyxpbmRpY2F0b3JfcmVkOmJvb2wsaW5kaWNhdG9yX2dyZWVuOmJvb2x9O0xFRFN0YXRlcz1bLzE2L0xFRFN0YXRlQ2FzZToxNl07TEVEU3RhdGVzRml4ZWQ9W0xFRFN0YXRlQ2FzZToxNl07RGV2aWNlTmFtZT1zOTtJbmVydGlhbEJpYXM9e2FjY2VsOlZlY3RvcjNmLGd5cm86VmVjdG9yM2Z9O1ZlbG9jaXR5UElEQnlwYXNzPXsvOC9mb3J3YXJkX21hc3Rlcjp2b2lkLHJpZ2h0X21hc3Rlcjp2b2lkLHVwX21hc3Rlcjp2b2lkLF91bnVzZWRfbWFzdGVyOnZvaWQsZm9yd2FyZF9zbGF2ZTp2b2lkLHJpZ2h0X3NsYXZlOnZvaWQsdXBfc2xhdmU6dm9pZCxfdW51c2VkX3NsYXZlOnZvaWR9O1ZlbG9jaXR5UElEUGFyYW1ldGVycz17Zm9yd2FyZF9tYXN0ZXI6UElEU2V0dGluZ3MscmlnaHRfbWFzdGVyOlBJRFNldHRpbmdzLHVwX21hc3RlcjpQSURTZXR0aW5ncyxmb3J3YXJkX3NsYXZlOlBJRFNldHRpbmdzLHJpZ2h0X3NsYXZlOlBJRFNldHRpbmdzLHVwX3NsYXZlOlBJRFNldHRpbmdzLHBpZF9ieXBhc3M6VmVsb2NpdHlQSURCeXBhc3N9O0NvbmZpZ3VyYXRpb249ey8xNi92ZXJzaW9uOlZlcnNpb24saWQ6Q29uZmlnSUQscGNiX3RyYW5zZm9ybTpQY2JUcmFuc2Zvcm0sbWl4X3RhYmxlOk1peFRhYmxlLG1hZ19iaWFzOk1hZ0JpYXMsY2hhbm5lbDpDaGFubmVsUHJvcGVydGllcyxwaWRfcGFyYW1ldGVyczpQSURQYXJhbWV0ZXJzLHN0YXRlX3BhcmFtZXRlcnM6U3RhdGVQYXJhbWV0ZXJzLGxlZF9zdGF0ZXM6TEVEU3RhdGVzLG5hbWU6RGV2aWNlTmFtZSx2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczpWZWxvY2l0eVBJRFBhcmFtZXRlcnMsaW5lcnRpYWxfYmlhczpJbmVydGlhbEJpYXN9O0NvbmZpZ3VyYXRpb25GaXhlZD17dmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlc0ZpeGVkLG5hbWU6RGV2aWNlTmFtZSx2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczpWZWxvY2l0eVBJRFBhcmFtZXRlcnMsaW5lcnRpYWxfYmlhczpJbmVydGlhbEJpYXN9O0NvbmZpZ3VyYXRpb25GbGFnPXsvMTYvdmVyc2lvbjp2b2lkLGlkOnZvaWQscGNiX3RyYW5zZm9ybTp2b2lkLG1peF90YWJsZTp2b2lkLG1hZ19iaWFzOnZvaWQsY2hhbm5lbDp2b2lkLHBpZF9wYXJhbWV0ZXJzOnZvaWQsc3RhdGVfcGFyYW1ldGVyczp2b2lkLGxlZF9zdGF0ZXM6Wy8vdm9pZDoxNl0sbmFtZTp2b2lkLHZlbG9jaXR5X3BpZF9wYXJhbWV0ZXJzOnZvaWQsaW5lcnRpYWxfYmlhczp2b2lkfTtSb3RhdGlvbj17cGl0Y2g6ZjMyLHJvbGw6ZjMyLHlhdzpmMzJ9O1BJRFN0YXRlPXt0aW1lc3RhbXBfdXM6dTMyLGlucHV0OmYzMixzZXRwb2ludDpmMzIscF90ZXJtOmYzMixpX3Rlcm06ZjMyLGRfdGVybTpmMzJ9O1JjQ29tbWFuZD17dGhyb3R0bGU6aTE2LHBpdGNoOmkxNixyb2xsOmkxNix5YXc6aTE2fTtTdGF0ZT17LzMyL3RpbWVzdGFtcF91czp1MzIsc3RhdHVzOlN0YXR1c0ZsYWcsdjBfcmF3OnUxNixpMF9yYXc6dTE2LGkxX3Jhdzp1MTYsYWNjZWw6VmVjdG9yM2YsZ3lybzpWZWN0b3IzZixtYWc6VmVjdG9yM2YsdGVtcGVyYXR1cmU6dTE2LHByZXNzdXJlOnUzMixwcG06W2kxNjo2XSxhdXhfY2hhbl9tYXNrOnU4LGNvbW1hbmQ6UmNDb21tYW5kLGNvbnRyb2w6e2Z6OmYzMix0eDpmMzIsdHk6ZjMyLHR6OmYzMn0scGlkX21hc3Rlcl9mejpQSURTdGF0ZSxwaWRfbWFzdGVyX3R4OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHk6UElEU3RhdGUscGlkX21hc3Rlcl90ejpQSURTdGF0ZSxwaWRfc2xhdmVfZno6UElEU3RhdGUscGlkX3NsYXZlX3R4OlBJRFN0YXRlLHBpZF9zbGF2ZV90eTpQSURTdGF0ZSxwaWRfc2xhdmVfdHo6UElEU3RhdGUsbW90b3Jfb3V0OltpMTY6OF0sa2luZW1hdGljc19hbmdsZTpSb3RhdGlvbixraW5lbWF0aWNzX3JhdGU6Um90YXRpb24sa2luZW1hdGljc19hbHRpdHVkZTpmMzIsbG9vcF9jb3VudDp1MzJ9O1N0YXRlRmllbGRzPXsvMzIvdGltZXN0YW1wX3VzOnZvaWQsc3RhdHVzOnZvaWQsdjBfcmF3OnZvaWQsaTBfcmF3OnZvaWQsaTFfcmF3OnZvaWQsYWNjZWw6dm9pZCxneXJvOnZvaWQsbWFnOnZvaWQsdGVtcGVyYXR1cmU6dm9pZCxwcmVzc3VyZTp2b2lkLHBwbTp2b2lkLGF1eF9jaGFuX21hc2s6dm9pZCxjb21tYW5kOnZvaWQsY29udHJvbDp2b2lkLHBpZF9tYXN0ZXJfZno6dm9pZCxwaWRfbWFzdGVyX3R4OnZvaWQscGlkX21hc3Rlcl90eTp2b2lkLHBpZF9tYXN0ZXJfdHo6dm9pZCxwaWRfc2xhdmVfZno6dm9pZCxwaWRfc2xhdmVfdHg6dm9pZCxwaWRfc2xhdmVfdHk6dm9pZCxwaWRfc2xhdmVfdHo6dm9pZCxtb3Rvcl9vdXQ6dm9pZCxraW5lbWF0aWNzX2FuZ2xlOnZvaWQsa2luZW1hdGljc19yYXRlOnZvaWQsa2luZW1hdGljc19hbHRpdHVkZTp2b2lkLGxvb3BfY291bnQ6dm9pZH07QXV4TWFzaz17Ly9hdXgxX2xvdzp2b2lkLGF1eDFfbWlkOnZvaWQsYXV4MV9oaWdoOnZvaWQsYXV4Ml9sb3c6dm9pZCxhdXgyX21pZDp2b2lkLGF1eDJfaGlnaDp2b2lkfTtDb21tYW5kPXsvMzIvcmVxdWVzdF9yZXNwb25zZTp2b2lkLHNldF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRml4ZWQscmVpbml0X2VlcHJvbV9kYXRhOnZvaWQscmVxdWVzdF9lZXByb21fZGF0YTp2b2lkLHJlcXVlc3RfZW5hYmxlX2l0ZXJhdGlvbjp1OCxtb3Rvcl9vdmVycmlkZV9zcGVlZF8wOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8xOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8yOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8zOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF80OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF81OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF82OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF83OnUxNixzZXRfY29tbWFuZF9vdmVycmlkZTpib29sLHNldF9zdGF0ZV9tYXNrOlN0YXRlRmllbGRzLHNldF9zdGF0ZV9kZWxheTp1MTYsc2V0X3NkX3dyaXRlX2RlbGF5OnUxNixzZXRfbGVkOntwYXR0ZXJuOnU4LGNvbG9yX3JpZ2h0OkNvbG9yLGNvbG9yX2xlZnQ6Q29sb3IsaW5kaWNhdG9yX3JlZDpib29sLGluZGljYXRvcl9ncmVlbjpib29sfSxzZXRfc2VyaWFsX3JjOntlbmFibGVkOmJvb2wsY29tbWFuZDpSY0NvbW1hbmQsYXV4X21hc2s6QXV4TWFza30sc2V0X2NhcmRfcmVjb3JkaW5nX3N0YXRlOnsvOC9yZWNvcmRfdG9fY2FyZDp2b2lkLGxvY2tfcmVjb3JkaW5nX3N0YXRlOnZvaWR9LHNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb24scmVpbml0X3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZsYWcscmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZsYWcscmVxX2NhcmRfcmVjb3JkaW5nX3N0YXRlOnZvaWQsc2V0X3BhcnRpYWxfdGVtcG9yYXJ5X2NvbmZpZzpDb25maWd1cmF0aW9uLHNldF9jb21tYW5kX3NvdXJjZXM6ey84L3NlcmlhbDp2b2lkLHJhZGlvOnZvaWR9LHNldF9jYWxpYnJhdGlvbjp7ZW5hYmxlZDpib29sLG1vZGU6dTh9LHNldF9hdXRvcGlsb3RfZW5hYmxlZDpib29sLHNldF91c2JfbW9kZTp1OH07RGVidWdTdHJpbmc9e2RlcHJlY2F0ZWRfbWFzazp1MzIsbWVzc2FnZTpzfTtIaXN0b3J5RGF0YT1EZWJ1Z1N0cmluZztSZXNwb25zZT17bWFzazp1MzIsYWNrOnUzMn07XCIsXCIxLjYudHh0Lmpzb25cIjpcIntcXFwidmVyc2lvblxcXCI6e1xcXCJtYWpvclxcXCI6MSxcXFwibWlub3JcXFwiOjYsXFxcInBhdGNoXFxcIjowfSxcXFwiaWRcXFwiOjAsXFxcInBjYl90cmFuc2Zvcm1cXFwiOntcXFwib3JpZW50YXRpb25cXFwiOntcXFwieFxcXCI6MCxcXFwieVxcXCI6MCxcXFwielxcXCI6MH0sXFxcInRyYW5zbGF0aW9uXFxcIjp7XFxcInhcXFwiOjAsXFxcInlcXFwiOjAsXFxcInpcXFwiOjB9fSxcXFwibWl4X3RhYmxlXFxcIjp7XFxcImZ6XFxcIjpbMSwxLDEsMSwxLDEsMSwxXSxcXFwidHhcXFwiOlsxLDEsMSwxLC0xLC0xLC0xLC0xXSxcXFwidHlcXFwiOlstMSwxLC0xLDEsLTEsMSwtMSwxXSxcXFwidHpcXFwiOlsxLC0xLC0xLDEsMSwtMSwtMSwxXX0sXFxcIm1hZ19iaWFzXFxcIjp7XFxcIm9mZnNldFxcXCI6e1xcXCJ4XFxcIjowLFxcXCJ5XFxcIjowLFxcXCJ6XFxcIjowfX0sXFxcImNoYW5uZWxcXFwiOntcXFwiYXNzaWdubWVudFxcXCI6e1xcXCJ0aHJ1c3RcXFwiOjIsXFxcInBpdGNoXFxcIjoxLFxcXCJyb2xsXFxcIjowLFxcXCJ5YXdcXFwiOjMsXFxcImF1eDFcXFwiOjQsXFxcImF1eDJcXFwiOjV9LFxcXCJpbnZlcnNpb25cXFwiOntcXFwidGhydXN0XFxcIjpudWxsLFxcXCJwaXRjaFxcXCI6dHJ1ZSxcXFwicm9sbFxcXCI6dHJ1ZSxcXFwieWF3XFxcIjpudWxsLFxcXCJhdXgxXFxcIjpudWxsLFxcXCJhdXgyXFxcIjpudWxsfSxcXFwibWlkcG9pbnRcXFwiOlsxNTAwLDE1MDAsMTUwMCwxNTAwLDE1MDAsMTUwMF0sXFxcImRlYWR6b25lXFxcIjpbMCwwLDAsMjAsMCwwXX0sXFxcInBpZF9wYXJhbWV0ZXJzXFxcIjp7XFxcInRocnVzdF9tYXN0ZXJcXFwiOntcXFwia3BcXFwiOjEuMCxcXFwia2lcXFwiOjAuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjowLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjEuMH0sXFxcInBpdGNoX21hc3RlclxcXCI6e1xcXCJrcFxcXCI6My41LFxcXCJraVxcXCI6MC41LFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjMwMC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjozMC4wfSxcXFwicm9sbF9tYXN0ZXJcXFwiOntcXFwia3BcXFwiOjMuNSxcXFwia2lcXFwiOjAuNSxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MzAuMH0sXFxcInlhd19tYXN0ZXJcXFwiOntcXFwia3BcXFwiOjEuMCxcXFwia2lcXFwiOjAuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjowLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjE4MC4wfSxcXFwidGhydXN0X3NsYXZlXFxcIjp7XFxcImtwXFxcIjoxLjAsXFxcImtpXFxcIjowLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxLjB9LFxcXCJwaXRjaF9zbGF2ZVxcXCI6e1xcXCJrcFxcXCI6NS4wLFxcXCJraVxcXCI6Mi4wLFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjMwMC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxNTAuMH0sXFxcInJvbGxfc2xhdmVcXFwiOntcXFwia3BcXFwiOjUuMCxcXFwia2lcXFwiOjIuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MTUwLjB9LFxcXCJ5YXdfc2xhdmVcXFwiOntcXFwia3BcXFwiOjQwLjAsXFxcImtpXFxcIjoxMC4wLFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjMwMC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoyNDAuMH0sXFxcInRocnVzdF9nYWluXFxcIjo0MDk1LFxcXCJwaXRjaF9nYWluXFxcIjoyMDQ3LFxcXCJyb2xsX2dhaW5cXFwiOjIwNDcsXFxcInlhd19nYWluXFxcIjoyMDQ3LFxcXCJwaWRfYnlwYXNzXFxcIjp7XFxcInRocnVzdF9tYXN0ZXJcXFwiOnRydWUsXFxcInBpdGNoX21hc3RlclxcXCI6bnVsbCxcXFwicm9sbF9tYXN0ZXJcXFwiOm51bGwsXFxcInlhd19tYXN0ZXJcXFwiOnRydWUsXFxcInRocnVzdF9zbGF2ZVxcXCI6dHJ1ZSxcXFwicGl0Y2hfc2xhdmVcXFwiOm51bGwsXFxcInJvbGxfc2xhdmVcXFwiOm51bGwsXFxcInlhd19zbGF2ZVxcXCI6bnVsbH19LFxcXCJzdGF0ZV9wYXJhbWV0ZXJzXFxcIjp7XFxcInN0YXRlX2VzdGltYXRpb25cXFwiOlsxLDAuMDFdLFxcXCJlbmFibGVcXFwiOlswLjAwMSwzMF19LFxcXCJsZWRfc3RhdGVzXFxcIjpbe1xcXCJzdGF0dXNcXFwiOntcXFwiY3Jhc2hfZGV0ZWN0ZWRcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX2ZsYXNofVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfT3JhbmdlfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJsb29wX3Nsb3dcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX3NvbGlkfVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfUmVkfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJvdmVycmlkZVxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fc29saWR9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9MaWdodFNlYUdyZWVufVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJsb2dfZnVsbFxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fZmxhc2h9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9PcmFuZ2V9XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LHtcXFwic3RhdHVzXFxcIjp7XFxcIm5vX3NpZ25hbFxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fZmxhc2h9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9HcmVlbn1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwiYXJtaW5nXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9mbGFzaH1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX0JsdWV9XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LHtcXFwic3RhdHVzXFxcIjp7XFxcImFybWVkXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9iZWFjb259XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9CbHVlfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJpZGxlXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9icmVhdGhlfVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfR3JlZW59XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiXSxcXFwibmFtZVxcXCI6XFxcIkZMWUJSSVhcXFwiLFxcXCJ2ZWxvY2l0eV9waWRfcGFyYW1ldGVyc1xcXCI6e1xcXCJmb3J3YXJkX21hc3RlclxcXCI6e1xcXCJrcFxcXCI6MSxcXFwia2lcXFwiOjAsXFxcImtkXFxcIjowLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjF9LFxcXCJyaWdodF9tYXN0ZXJcXFwiOntcXFwia3BcXFwiOjEwLFxcXCJraVxcXCI6MSxcXFwia2RcXFwiOjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MTAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjEwfSxcXFwidXBfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjoxMCxcXFwia2lcXFwiOjEsXFxcImtkXFxcIjowLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjEwLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxMH0sXFxcImZvcndhcmRfc2xhdmVcXFwiOntcXFwia3BcXFwiOjEsXFxcImtpXFxcIjowLFxcXCJrZFxcXCI6MCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjoxMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MC4zfSxcXFwicmlnaHRfc2xhdmVcXFwiOntcXFwia3BcXFwiOjEwLFxcXCJraVxcXCI6NCxcXFwia2RcXFwiOjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjMwfSxcXFwidXBfc2xhdmVcXFwiOntcXFwia3BcXFwiOjEwLFxcXCJraVxcXCI6NCxcXFwia2RcXFwiOjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjMwfSxcXFwicGlkX2J5cGFzc1xcXCI6e1xcXCJmb3J3YXJkX21hc3RlclxcXCI6dHJ1ZSxcXFwicmlnaHRfbWFzdGVyXFxcIjp0cnVlLFxcXCJ1cF9tYXN0ZXJcXFwiOnRydWUsXFxcImZvcndhcmRfc2xhdmVcXFwiOnRydWUsXFxcInJpZ2h0X3NsYXZlXFxcIjp0cnVlLFxcXCJ1cF9zbGF2ZVxcXCI6dHJ1ZX19LFxcXCJpbmVydGlhbF9iaWFzXFxcIjp7XFxcImFjY2VsXFxcIjp7XFxcInhcXFwiOjAsXFxcInlcXFwiOjAsXFxcInpcXFwiOjB9LFxcXCJneXJvXFxcIjp7XFxcInhcXFwiOjAsXFxcInlcXFwiOjAsXFxcInpcXFwiOjB9fX1cIixcIjEuNy50eHRcIjpcIlZlY3RvcjNmPXt4OmYzMix5OmYzMix6OmYzMn07UElEU2V0dGluZ3M9e2twOmYzMixraTpmMzIsa2Q6ZjMyLGludGVncmFsX3dpbmR1cF9ndWFyZDpmMzIsZF9maWx0ZXJfdGltZTpmMzIsc2V0cG9pbnRfZmlsdGVyX3RpbWU6ZjMyLGNvbW1hbmRfdG9fdmFsdWU6ZjMyfTtWZXJzaW9uPXttYWpvcjp1OCxtaW5vcjp1OCxwYXRjaDp1OH07Q29uZmlnSUQ9dTMyO1BjYlRyYW5zZm9ybT17b3JpZW50YXRpb246VmVjdG9yM2YsdHJhbnNsYXRpb246VmVjdG9yM2Z9O01peFRhYmxlPXtmejpbaTg6OF0sdHg6W2k4OjhdLHR5OltpODo4XSx0ejpbaTg6OF19O01hZ0JpYXM9e29mZnNldDpWZWN0b3IzZn07Q2hhbm5lbFByb3BlcnRpZXM9e2Fzc2lnbm1lbnQ6e3RocnVzdDp1OCxwaXRjaDp1OCxyb2xsOnU4LHlhdzp1OCxhdXgxOnU4LGF1eDI6dTh9LGludmVyc2lvbjp7LzgvdGhydXN0OnZvaWQscGl0Y2g6dm9pZCxyb2xsOnZvaWQseWF3OnZvaWQsYXV4MTp2b2lkLGF1eDI6dm9pZH0sbWlkcG9pbnQ6W3UxNjo2XSxkZWFkem9uZTpbdTE2OjZdfTtQSURCeXBhc3M9ey84L3RocnVzdF9tYXN0ZXI6dm9pZCxwaXRjaF9tYXN0ZXI6dm9pZCxyb2xsX21hc3Rlcjp2b2lkLHlhd19tYXN0ZXI6dm9pZCx0aHJ1c3Rfc2xhdmU6dm9pZCxwaXRjaF9zbGF2ZTp2b2lkLHJvbGxfc2xhdmU6dm9pZCx5YXdfc2xhdmU6dm9pZH07UElEUGFyYW1ldGVycz17dGhydXN0X21hc3RlcjpQSURTZXR0aW5ncyxwaXRjaF9tYXN0ZXI6UElEU2V0dGluZ3Mscm9sbF9tYXN0ZXI6UElEU2V0dGluZ3MseWF3X21hc3RlcjpQSURTZXR0aW5ncyx0aHJ1c3Rfc2xhdmU6UElEU2V0dGluZ3MscGl0Y2hfc2xhdmU6UElEU2V0dGluZ3Mscm9sbF9zbGF2ZTpQSURTZXR0aW5ncyx5YXdfc2xhdmU6UElEU2V0dGluZ3MsdGhydXN0X2dhaW46ZjMyLHBpdGNoX2dhaW46ZjMyLHJvbGxfZ2FpbjpmMzIseWF3X2dhaW46ZjMyLHBpZF9ieXBhc3M6UElEQnlwYXNzfTtTdGF0ZVBhcmFtZXRlcnM9e3N0YXRlX2VzdGltYXRpb246W2YzMjoyXSxlbmFibGU6W2YzMjoyXX07U3RhdHVzRmxhZz17LzE2L18wOnZvaWQsXzE6dm9pZCxfMjp2b2lkLG5vX3NpZ25hbDp2b2lkLGlkbGU6dm9pZCxhcm1pbmc6dm9pZCxyZWNvcmRpbmdfc2Q6dm9pZCxfNzp2b2lkLGxvb3Bfc2xvdzp2b2lkLF85OnZvaWQsYXJtZWQ6dm9pZCxiYXR0ZXJ5X2xvdzp2b2lkLGJhdHRlcnlfY3JpdGljYWw6dm9pZCxsb2dfZnVsbDp2b2lkLGNyYXNoX2RldGVjdGVkOnZvaWQsb3ZlcnJpZGU6dm9pZH07Q29sb3I9e3JlZDp1OCxncmVlbjp1OCxibHVlOnU4fTtMRURTdGF0ZUNvbG9ycz17cmlnaHRfZnJvbnQ6Q29sb3IscmlnaHRfYmFjazpDb2xvcixsZWZ0X2Zyb250OkNvbG9yLGxlZnRfYmFjazpDb2xvcn07TEVEU3RhdGVDYXNlPXtzdGF0dXM6U3RhdHVzRmxhZyxwYXR0ZXJuOnU4LGNvbG9yczpMRURTdGF0ZUNvbG9ycyxpbmRpY2F0b3JfcmVkOmJvb2wsaW5kaWNhdG9yX2dyZWVuOmJvb2x9O0xFRFN0YXRlcz1bLzE2L0xFRFN0YXRlQ2FzZToxNl07TEVEU3RhdGVzRml4ZWQ9W0xFRFN0YXRlQ2FzZToxNl07RGV2aWNlTmFtZT1zOTtJbmVydGlhbEJpYXM9e2FjY2VsOlZlY3RvcjNmLGd5cm86VmVjdG9yM2Z9O1ZlbG9jaXR5UElEQnlwYXNzPXsvOC9mb3J3YXJkX21hc3Rlcjp2b2lkLHJpZ2h0X21hc3Rlcjp2b2lkLHVwX21hc3Rlcjp2b2lkLF91bnVzZWRfbWFzdGVyOnZvaWQsZm9yd2FyZF9zbGF2ZTp2b2lkLHJpZ2h0X3NsYXZlOnZvaWQsdXBfc2xhdmU6dm9pZCxfdW51c2VkX3NsYXZlOnZvaWR9O1ZlbG9jaXR5UElEUGFyYW1ldGVycz17Zm9yd2FyZF9tYXN0ZXI6UElEU2V0dGluZ3MscmlnaHRfbWFzdGVyOlBJRFNldHRpbmdzLHVwX21hc3RlcjpQSURTZXR0aW5ncyxmb3J3YXJkX3NsYXZlOlBJRFNldHRpbmdzLHJpZ2h0X3NsYXZlOlBJRFNldHRpbmdzLHVwX3NsYXZlOlBJRFNldHRpbmdzLHBpZF9ieXBhc3M6VmVsb2NpdHlQSURCeXBhc3N9O0NvbmZpZ3VyYXRpb249ey8xNi92ZXJzaW9uOlZlcnNpb24saWQ6Q29uZmlnSUQscGNiX3RyYW5zZm9ybTpQY2JUcmFuc2Zvcm0sbWl4X3RhYmxlOk1peFRhYmxlLG1hZ19iaWFzOk1hZ0JpYXMsY2hhbm5lbDpDaGFubmVsUHJvcGVydGllcyxwaWRfcGFyYW1ldGVyczpQSURQYXJhbWV0ZXJzLHN0YXRlX3BhcmFtZXRlcnM6U3RhdGVQYXJhbWV0ZXJzLGxlZF9zdGF0ZXM6TEVEU3RhdGVzLG5hbWU6RGV2aWNlTmFtZSx2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczpWZWxvY2l0eVBJRFBhcmFtZXRlcnMsaW5lcnRpYWxfYmlhczpJbmVydGlhbEJpYXN9O0NvbmZpZ3VyYXRpb25GaXhlZD17dmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlc0ZpeGVkLG5hbWU6RGV2aWNlTmFtZSx2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczpWZWxvY2l0eVBJRFBhcmFtZXRlcnMsaW5lcnRpYWxfYmlhczpJbmVydGlhbEJpYXN9O0NvbmZpZ3VyYXRpb25GbGFnPXsvMTYvdmVyc2lvbjp2b2lkLGlkOnZvaWQscGNiX3RyYW5zZm9ybTp2b2lkLG1peF90YWJsZTp2b2lkLG1hZ19iaWFzOnZvaWQsY2hhbm5lbDp2b2lkLHBpZF9wYXJhbWV0ZXJzOnZvaWQsc3RhdGVfcGFyYW1ldGVyczp2b2lkLGxlZF9zdGF0ZXM6Wy8vdm9pZDoxNl0sbmFtZTp2b2lkLHZlbG9jaXR5X3BpZF9wYXJhbWV0ZXJzOnZvaWQsaW5lcnRpYWxfYmlhczp2b2lkfTtSb3RhdGlvbj17cGl0Y2g6ZjMyLHJvbGw6ZjMyLHlhdzpmMzJ9O1BJRFN0YXRlPXt0aW1lc3RhbXBfdXM6dTMyLGlucHV0OmYzMixzZXRwb2ludDpmMzIscF90ZXJtOmYzMixpX3Rlcm06ZjMyLGRfdGVybTpmMzJ9O1JjQ29tbWFuZD17dGhyb3R0bGU6aTE2LHBpdGNoOmkxNixyb2xsOmkxNix5YXc6aTE2fTtTdGF0ZT17LzMyL3RpbWVzdGFtcF91czp1MzIsc3RhdHVzOlN0YXR1c0ZsYWcsdjBfcmF3OnUxNixpMF9yYXc6dTE2LGkxX3Jhdzp1MTYsYWNjZWw6VmVjdG9yM2YsZ3lybzpWZWN0b3IzZixtYWc6VmVjdG9yM2YsdGVtcGVyYXR1cmU6dTE2LHByZXNzdXJlOnUzMixwcG06W2kxNjo2XSxhdXhfY2hhbl9tYXNrOnU4LGNvbW1hbmQ6UmNDb21tYW5kLGNvbnRyb2w6e2Z6OmYzMix0eDpmMzIsdHk6ZjMyLHR6OmYzMn0scGlkX21hc3Rlcl9mejpQSURTdGF0ZSxwaWRfbWFzdGVyX3R4OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHk6UElEU3RhdGUscGlkX21hc3Rlcl90ejpQSURTdGF0ZSxwaWRfc2xhdmVfZno6UElEU3RhdGUscGlkX3NsYXZlX3R4OlBJRFN0YXRlLHBpZF9zbGF2ZV90eTpQSURTdGF0ZSxwaWRfc2xhdmVfdHo6UElEU3RhdGUsbW90b3Jfb3V0OltpMTY6OF0sa2luZW1hdGljc19hbmdsZTpSb3RhdGlvbixraW5lbWF0aWNzX3JhdGU6Um90YXRpb24sa2luZW1hdGljc19hbHRpdHVkZTpmMzIsbG9vcF9jb3VudDp1MzJ9O1N0YXRlRmllbGRzPXsvMzIvdGltZXN0YW1wX3VzOnZvaWQsc3RhdHVzOnZvaWQsdjBfcmF3OnZvaWQsaTBfcmF3OnZvaWQsaTFfcmF3OnZvaWQsYWNjZWw6dm9pZCxneXJvOnZvaWQsbWFnOnZvaWQsdGVtcGVyYXR1cmU6dm9pZCxwcmVzc3VyZTp2b2lkLHBwbTp2b2lkLGF1eF9jaGFuX21hc2s6dm9pZCxjb21tYW5kOnZvaWQsY29udHJvbDp2b2lkLHBpZF9tYXN0ZXJfZno6dm9pZCxwaWRfbWFzdGVyX3R4OnZvaWQscGlkX21hc3Rlcl90eTp2b2lkLHBpZF9tYXN0ZXJfdHo6dm9pZCxwaWRfc2xhdmVfZno6dm9pZCxwaWRfc2xhdmVfdHg6dm9pZCxwaWRfc2xhdmVfdHk6dm9pZCxwaWRfc2xhdmVfdHo6dm9pZCxtb3Rvcl9vdXQ6dm9pZCxraW5lbWF0aWNzX2FuZ2xlOnZvaWQsa2luZW1hdGljc19yYXRlOnZvaWQsa2luZW1hdGljc19hbHRpdHVkZTp2b2lkLGxvb3BfY291bnQ6dm9pZH07QXV4TWFzaz17Ly9hdXgxX2xvdzp2b2lkLGF1eDFfbWlkOnZvaWQsYXV4MV9oaWdoOnZvaWQsYXV4Ml9sb3c6dm9pZCxhdXgyX21pZDp2b2lkLGF1eDJfaGlnaDp2b2lkfTtDb21tYW5kPXsvMzIvcmVxdWVzdF9yZXNwb25zZTp2b2lkLHNldF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRml4ZWQscmVpbml0X2VlcHJvbV9kYXRhOnZvaWQscmVxdWVzdF9lZXByb21fZGF0YTp2b2lkLHJlcXVlc3RfZW5hYmxlX2l0ZXJhdGlvbjp1OCxtb3Rvcl9vdmVycmlkZV9zcGVlZF8wOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8xOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8yOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8zOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF80OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF81OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF82OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF83OnUxNixzZXRfY29tbWFuZF9vdmVycmlkZTpib29sLHNldF9zdGF0ZV9tYXNrOlN0YXRlRmllbGRzLHNldF9zdGF0ZV9kZWxheTp1MTYsc2V0X3NkX3dyaXRlX2RlbGF5OnUxNixzZXRfbGVkOntwYXR0ZXJuOnU4LGNvbG9yX3JpZ2h0X2Zyb250OkNvbG9yLGNvbG9yX2xlZnRfZnJvbnQ6Q29sb3IsY29sb3JfcmlnaHRfYmFjazpDb2xvcixjb2xvcl9sZWZ0X2JhY2s6Q29sb3IsaW5kaWNhdG9yX3JlZDpib29sLGluZGljYXRvcl9ncmVlbjpib29sfSxzZXRfc2VyaWFsX3JjOntlbmFibGVkOmJvb2wsY29tbWFuZDpSY0NvbW1hbmQsYXV4X21hc2s6QXV4TWFza30sc2V0X2NhcmRfcmVjb3JkaW5nX3N0YXRlOnsvOC9yZWNvcmRfdG9fY2FyZDp2b2lkLGxvY2tfcmVjb3JkaW5nX3N0YXRlOnZvaWR9LHNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb24scmVpbml0X3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZsYWcscmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZsYWcscmVxX2NhcmRfcmVjb3JkaW5nX3N0YXRlOnZvaWQsc2V0X3BhcnRpYWxfdGVtcG9yYXJ5X2NvbmZpZzpDb25maWd1cmF0aW9uLHNldF9jb21tYW5kX3NvdXJjZXM6ey84L3NlcmlhbDp2b2lkLHJhZGlvOnZvaWR9LHNldF9jYWxpYnJhdGlvbjp7ZW5hYmxlZDpib29sLG1vZGU6dTh9LHNldF9hdXRvcGlsb3RfZW5hYmxlZDpib29sLHNldF91c2JfbW9kZTp1OH07RGVidWdTdHJpbmc9e2RlcHJlY2F0ZWRfbWFzazp1MzIsbWVzc2FnZTpzfTtIaXN0b3J5RGF0YT1EZWJ1Z1N0cmluZztSZXNwb25zZT17bWFzazp1MzIsYWNrOnUzMn07XCIsXCIxLjcudHh0Lmpzb25cIjpcIntcXFwidmVyc2lvblxcXCI6e1xcXCJtYWpvclxcXCI6MSxcXFwibWlub3JcXFwiOjcsXFxcInBhdGNoXFxcIjowfSxcXFwiaWRcXFwiOjAsXFxcInBjYl90cmFuc2Zvcm1cXFwiOntcXFwib3JpZW50YXRpb25cXFwiOntcXFwieFxcXCI6MCxcXFwieVxcXCI6MCxcXFwielxcXCI6MH0sXFxcInRyYW5zbGF0aW9uXFxcIjp7XFxcInhcXFwiOjAsXFxcInlcXFwiOjAsXFxcInpcXFwiOjB9fSxcXFwibWl4X3RhYmxlXFxcIjp7XFxcImZ6XFxcIjpbMSwxLDEsMSwxLDEsMSwxXSxcXFwidHhcXFwiOlsxLDEsMSwxLC0xLC0xLC0xLC0xXSxcXFwidHlcXFwiOlstMSwxLC0xLDEsLTEsMSwtMSwxXSxcXFwidHpcXFwiOlsxLC0xLC0xLDEsMSwtMSwtMSwxXX0sXFxcIm1hZ19iaWFzXFxcIjp7XFxcIm9mZnNldFxcXCI6e1xcXCJ4XFxcIjowLFxcXCJ5XFxcIjowLFxcXCJ6XFxcIjowfX0sXFxcImNoYW5uZWxcXFwiOntcXFwiYXNzaWdubWVudFxcXCI6e1xcXCJ0aHJ1c3RcXFwiOjIsXFxcInBpdGNoXFxcIjoxLFxcXCJyb2xsXFxcIjowLFxcXCJ5YXdcXFwiOjMsXFxcImF1eDFcXFwiOjQsXFxcImF1eDJcXFwiOjV9LFxcXCJpbnZlcnNpb25cXFwiOntcXFwidGhydXN0XFxcIjpudWxsLFxcXCJwaXRjaFxcXCI6dHJ1ZSxcXFwicm9sbFxcXCI6dHJ1ZSxcXFwieWF3XFxcIjpudWxsLFxcXCJhdXgxXFxcIjpudWxsLFxcXCJhdXgyXFxcIjpudWxsfSxcXFwibWlkcG9pbnRcXFwiOlsxNTAwLDE1MDAsMTUwMCwxNTAwLDE1MDAsMTUwMF0sXFxcImRlYWR6b25lXFxcIjpbMCwwLDAsMjAsMCwwXX0sXFxcInBpZF9wYXJhbWV0ZXJzXFxcIjp7XFxcInRocnVzdF9tYXN0ZXJcXFwiOntcXFwia3BcXFwiOjEuMCxcXFwia2lcXFwiOjAuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjowLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjEuMH0sXFxcInBpdGNoX21hc3RlclxcXCI6e1xcXCJrcFxcXCI6My41LFxcXCJraVxcXCI6MC41LFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjMwMC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjozMC4wfSxcXFwicm9sbF9tYXN0ZXJcXFwiOntcXFwia3BcXFwiOjMuNSxcXFwia2lcXFwiOjAuNSxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MzAuMH0sXFxcInlhd19tYXN0ZXJcXFwiOntcXFwia3BcXFwiOjEuMCxcXFwia2lcXFwiOjAuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjowLjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjE4MC4wfSxcXFwidGhydXN0X3NsYXZlXFxcIjp7XFxcImtwXFxcIjoxLjAsXFxcImtpXFxcIjowLjAsXFxcImtkXFxcIjowLjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxLjB9LFxcXCJwaXRjaF9zbGF2ZVxcXCI6e1xcXCJrcFxcXCI6NS4wLFxcXCJraVxcXCI6Mi4wLFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjMwMC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxNTAuMH0sXFxcInJvbGxfc2xhdmVcXFwiOntcXFwia3BcXFwiOjUuMCxcXFwia2lcXFwiOjIuMCxcXFwia2RcXFwiOjAuMCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjozMDAuMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MTUwLjB9LFxcXCJ5YXdfc2xhdmVcXFwiOntcXFwia3BcXFwiOjQwLjAsXFxcImtpXFxcIjoxMC4wLFxcXCJrZFxcXCI6MC4wLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjMwMC4wLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoyNDAuMH0sXFxcInRocnVzdF9nYWluXFxcIjo0MDk1LFxcXCJwaXRjaF9nYWluXFxcIjoyMDQ3LFxcXCJyb2xsX2dhaW5cXFwiOjIwNDcsXFxcInlhd19nYWluXFxcIjoyMDQ3LFxcXCJwaWRfYnlwYXNzXFxcIjp7XFxcInRocnVzdF9tYXN0ZXJcXFwiOnRydWUsXFxcInBpdGNoX21hc3RlclxcXCI6bnVsbCxcXFwicm9sbF9tYXN0ZXJcXFwiOm51bGwsXFxcInlhd19tYXN0ZXJcXFwiOnRydWUsXFxcInRocnVzdF9zbGF2ZVxcXCI6dHJ1ZSxcXFwicGl0Y2hfc2xhdmVcXFwiOm51bGwsXFxcInJvbGxfc2xhdmVcXFwiOm51bGwsXFxcInlhd19zbGF2ZVxcXCI6bnVsbH19LFxcXCJzdGF0ZV9wYXJhbWV0ZXJzXFxcIjp7XFxcInN0YXRlX2VzdGltYXRpb25cXFwiOlsxLDAuMDFdLFxcXCJlbmFibGVcXFwiOlswLjAwMSwzMF19LFxcXCJsZWRfc3RhdGVzXFxcIjpbe1xcXCJzdGF0dXNcXFwiOntcXFwiY3Jhc2hfZGV0ZWN0ZWRcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX2ZsYXNofVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfT3JhbmdlfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJsb29wX3Nsb3dcXFwiOnRydWV9LFxcXCJwYXR0ZXJuXFxcIjpcXFwiJHtQQVRURVJOX3NvbGlkfVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfUmVkfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJvdmVycmlkZVxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fc29saWR9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9MaWdodFNlYUdyZWVufVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJsb2dfZnVsbFxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fZmxhc2h9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9PcmFuZ2V9XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LHtcXFwic3RhdHVzXFxcIjp7XFxcIm5vX3NpZ25hbFxcXCI6dHJ1ZX0sXFxcInBhdHRlcm5cXFwiOlxcXCIke1BBVFRFUk5fZmxhc2h9XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9HcmVlbn1cXFwiLFxcXCJpbmRpY2F0b3JfcmVkXFxcIjpmYWxzZSxcXFwiaW5kaWNhdG9yX2dyZWVuXFxcIjpmYWxzZX0se1xcXCJzdGF0dXNcXFwiOntcXFwiYXJtaW5nXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9mbGFzaH1cXFwiLFxcXCJjb2xvcnNcXFwiOlxcXCIke0NPTE9SX0JsdWV9XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LHtcXFwic3RhdHVzXFxcIjp7XFxcImFybWVkXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9iZWFjb259XFxcIixcXFwiY29sb3JzXFxcIjpcXFwiJHtDT0xPUl9CbHVlfVxcXCIsXFxcImluZGljYXRvcl9yZWRcXFwiOmZhbHNlLFxcXCJpbmRpY2F0b3JfZ3JlZW5cXFwiOmZhbHNlfSx7XFxcInN0YXR1c1xcXCI6e1xcXCJpZGxlXFxcIjp0cnVlfSxcXFwicGF0dGVyblxcXCI6XFxcIiR7UEFUVEVSTl9icmVhdGhlfVxcXCIsXFxcImNvbG9yc1xcXCI6XFxcIiR7Q09MT1JfR3JlZW59XFxcIixcXFwiaW5kaWNhdG9yX3JlZFxcXCI6ZmFsc2UsXFxcImluZGljYXRvcl9ncmVlblxcXCI6ZmFsc2V9LFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiLFxcXCIke0xFRF91bnVzZWRfbW9kZX1cXFwiXSxcXFwibmFtZVxcXCI6XFxcIkZMWUJSSVhcXFwiLFxcXCJ2ZWxvY2l0eV9waWRfcGFyYW1ldGVyc1xcXCI6e1xcXCJmb3J3YXJkX21hc3RlclxcXCI6e1xcXCJrcFxcXCI6MSxcXFwia2lcXFwiOjAsXFxcImtkXFxcIjowLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjF9LFxcXCJyaWdodF9tYXN0ZXJcXFwiOntcXFwia3BcXFwiOjEwLFxcXCJraVxcXCI6MSxcXFwia2RcXFwiOjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MTAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDUsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjEwfSxcXFwidXBfbWFzdGVyXFxcIjp7XFxcImtwXFxcIjoxMCxcXFwia2lcXFwiOjEsXFxcImtkXFxcIjowLFxcXCJpbnRlZ3JhbF93aW5kdXBfZ3VhcmRcXFwiOjEwLFxcXCJkX2ZpbHRlcl90aW1lXFxcIjowLjAwNSxcXFwic2V0cG9pbnRfZmlsdGVyX3RpbWVcXFwiOjAuMDA1LFxcXCJjb21tYW5kX3RvX3ZhbHVlXFxcIjoxMH0sXFxcImZvcndhcmRfc2xhdmVcXFwiOntcXFwia3BcXFwiOjEsXFxcImtpXFxcIjowLFxcXCJrZFxcXCI6MCxcXFwiaW50ZWdyYWxfd2luZHVwX2d1YXJkXFxcIjoxMCxcXFwiZF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcInNldHBvaW50X2ZpbHRlcl90aW1lXFxcIjowLjAwMSxcXFwiY29tbWFuZF90b192YWx1ZVxcXCI6MC4zfSxcXFwicmlnaHRfc2xhdmVcXFwiOntcXFwia3BcXFwiOjEwLFxcXCJraVxcXCI6NCxcXFwia2RcXFwiOjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjMwfSxcXFwidXBfc2xhdmVcXFwiOntcXFwia3BcXFwiOjEwLFxcXCJraVxcXCI6NCxcXFwia2RcXFwiOjAsXFxcImludGVncmFsX3dpbmR1cF9ndWFyZFxcXCI6MzAsXFxcImRfZmlsdGVyX3RpbWVcXFwiOjAuMDAxLFxcXCJzZXRwb2ludF9maWx0ZXJfdGltZVxcXCI6MC4wMDEsXFxcImNvbW1hbmRfdG9fdmFsdWVcXFwiOjMwfSxcXFwicGlkX2J5cGFzc1xcXCI6e1xcXCJmb3J3YXJkX21hc3RlclxcXCI6dHJ1ZSxcXFwicmlnaHRfbWFzdGVyXFxcIjp0cnVlLFxcXCJ1cF9tYXN0ZXJcXFwiOnRydWUsXFxcImZvcndhcmRfc2xhdmVcXFwiOnRydWUsXFxcInJpZ2h0X3NsYXZlXFxcIjp0cnVlLFxcXCJ1cF9zbGF2ZVxcXCI6dHJ1ZX19LFxcXCJpbmVydGlhbF9iaWFzXFxcIjp7XFxcImFjY2VsXFxcIjp7XFxcInhcXFwiOjAsXFxcInlcXFwiOjAsXFxcInpcXFwiOjB9LFxcXCJneXJvXFxcIjp7XFxcInhcXFwiOjAsXFxcInlcXFwiOjAsXFxcInpcXFwiOjB9fX1cIn07XG4gICAgICAgIHJldHVybiB7IHZlcnNpb25zOiB2ZXJzaW9ucywgZmlsZXM6IGZpbGVzIH07XG4gICAgfVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdjYWxpYnJhdGlvbicsIGNhbGlicmF0aW9uKTtcclxuXHJcbiAgICBjYWxpYnJhdGlvbi4kaW5qZWN0ID0gWydjb21tYW5kTG9nJywgJ3NlcmlhbCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNhbGlicmF0aW9uKGNvbW1hbmRMb2csIHNlcmlhbCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG1hZ25ldG9tZXRlcjogbWFnbmV0b21ldGVyLFxyXG4gICAgICAgICAgICBhY2NlbGVyb21ldGVyOiB7XHJcbiAgICAgICAgICAgICAgICBmbGF0OiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2ZsYXQnLCAwKSxcclxuICAgICAgICAgICAgICAgIGZvcndhcmQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiBmb3J3YXJkJywgMSksXHJcbiAgICAgICAgICAgICAgICBiYWNrOiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gYmFjaycsIDIpLFxyXG4gICAgICAgICAgICAgICAgcmlnaHQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiByaWdodCcsIDMpLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIGxlZnQnLCA0KSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmluaXNoOiBmaW5pc2gsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbWFnbmV0b21ldGVyKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiQ2FsaWJyYXRpbmcgbWFnbmV0b21ldGVyIGJpYXNcIik7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzZXRfY2FsaWJyYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IDAsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyKHBvc2VEZXNjcmlwdGlvbiwgcG9zZUlkKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coXCJDYWxpYnJhdGluZyBncmF2aXR5IGZvciBwb3NlOiBcIiArIHBvc2VEZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzZXRfY2FsaWJyYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IHBvc2VJZCArIDEsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBmaW5pc2goKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coXCJGaW5pc2hpbmcgY2FsaWJyYXRpb25cIik7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzZXRfY2FsaWJyYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiAwLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY29icycsIGNvYnMpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNvYnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgUmVhZGVyOiBSZWFkZXIsXHJcbiAgICAgICAgICAgIGVuY29kZTogZW5jb2RlLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIFJlYWRlcihjYXBhY2l0eSkge1xyXG4gICAgICAgIGlmIChjYXBhY2l0eSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGNhcGFjaXR5ID0gMjAwMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5OID0gY2FwYWNpdHk7XHJcbiAgICAgICAgdGhpcy5idWZmZXIgPSBuZXcgVWludDhBcnJheShjYXBhY2l0eSk7XHJcbiAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuYnVmZmVyX2xlbmd0aCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY29ic0RlY29kZShyZWFkZXIpIHtcclxuICAgICAgICB2YXIgc3JjX3B0ciA9IDA7XHJcbiAgICAgICAgdmFyIGRzdF9wdHIgPSAwO1xyXG4gICAgICAgIHZhciBsZWZ0b3Zlcl9sZW5ndGggPSAwO1xyXG4gICAgICAgIHZhciBhcHBlbmRfemVybyA9IGZhbHNlO1xyXG4gICAgICAgIHdoaWxlIChyZWFkZXIuYnVmZmVyW3NyY19wdHJdKSB7XHJcbiAgICAgICAgICAgIGlmICghbGVmdG92ZXJfbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXBwZW5kX3plcm8pXHJcbiAgICAgICAgICAgICAgICAgICAgcmVhZGVyLmJ1ZmZlcltkc3RfcHRyKytdID0gMDtcclxuICAgICAgICAgICAgICAgIGxlZnRvdmVyX2xlbmd0aCA9IHJlYWRlci5idWZmZXJbc3JjX3B0cisrXSAtIDE7XHJcbiAgICAgICAgICAgICAgICBhcHBlbmRfemVybyA9IGxlZnRvdmVyX2xlbmd0aCA8IDB4RkU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAtLWxlZnRvdmVyX2xlbmd0aDtcclxuICAgICAgICAgICAgICAgIHJlYWRlci5idWZmZXJbZHN0X3B0cisrXSA9IHJlYWRlci5idWZmZXJbc3JjX3B0cisrXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGxlZnRvdmVyX2xlbmd0aCA/IDAgOiBkc3RfcHRyO1xyXG4gICAgfVxyXG5cclxuICAgIFJlYWRlci5wcm90b3R5cGUucmVhZEJ5dGVzID0gZnVuY3Rpb24oZGF0YSwgb25TdWNjZXNzLCBvbkVycm9yKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBjID0gZGF0YVtpXTtcclxuICAgICAgICAgICAgaWYgKHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCBieXRlIG9mIGEgbmV3IG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcl9sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlclt0aGlzLmJ1ZmZlcl9sZW5ndGgrK10gPSBjO1xyXG5cclxuICAgICAgICAgICAgaWYgKGMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJ1ZmZlcl9sZW5ndGggPT09IHRoaXMuTikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGJ1ZmZlciBvdmVyZmxvdywgcHJvYmFibHkgZHVlIHRvIGVycm9ycyBpbiBkYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignb3ZlcmZsb3cnLCAnYnVmZmVyIG92ZXJmbG93IGluIENPQlMgZGVjb2RpbmcnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5idWZmZXJfbGVuZ3RoID0gY29ic0RlY29kZSh0aGlzKTtcclxuICAgICAgICAgICAgdmFyIGZhaWxlZF9kZWNvZGUgPSAodGhpcy5idWZmZXJfbGVuZ3RoID09PSAwKTtcclxuICAgICAgICAgICAgaWYgKGZhaWxlZF9kZWNvZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyWzBdID0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgajtcclxuICAgICAgICAgICAgZm9yIChqID0gMTsgaiA8IHRoaXMuYnVmZmVyX2xlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlclswXSBePSB0aGlzLmJ1ZmZlcltqXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5idWZmZXJbMF0gPT09IDApIHsgIC8vIGNoZWNrIHN1bSBpcyBjb3JyZWN0XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWZmZXJfbGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uU3VjY2Vzcyh0aGlzLmJ1ZmZlci5zbGljZSgxLCB0aGlzLmJ1ZmZlcl9sZW5ndGgpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignc2hvcnQnLCAnVG9vIHNob3J0IHBhY2tldCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgeyAgLy8gYmFkIGNoZWNrc3VtXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgYnl0ZXMgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHRoaXMuYnVmZmVyX2xlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnl0ZXMgKz0gdGhpcy5idWZmZXJbal0gKyBcIixcIjtcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy5idWZmZXJbal0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGZhaWxlZF9kZWNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCdmcmFtZScsICdVbmV4cGVjdGVkIGVuZGluZyBvZiBwYWNrZXQnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1zZyA9ICdCQUQgQ0hFQ0tTVU0gKCcgKyB0aGlzLmJ1ZmZlcl9sZW5ndGggK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnIGJ5dGVzKScgKyBieXRlcyArIG1lc3NhZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignY2hlY2tzdW0nLCBtc2cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBlbmNvZGUoYnVmKSB7XHJcbiAgICAgICAgdmFyIHJldHZhbCA9XHJcbiAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KE1hdGguZmxvb3IoKGJ1Zi5ieXRlTGVuZ3RoICogMjU1ICsgNzYxKSAvIDI1NCkpO1xyXG4gICAgICAgIHZhciBsZW4gPSAxO1xyXG4gICAgICAgIHZhciBwb3NfY3RyID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1Zi5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBpZiAocmV0dmFsW3Bvc19jdHJdID09IDB4RkUpIHtcclxuICAgICAgICAgICAgICAgIHJldHZhbFtwb3NfY3RyXSA9IDB4RkY7XHJcbiAgICAgICAgICAgICAgICBwb3NfY3RyID0gbGVuKys7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbcG9zX2N0cl0gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB2YWwgPSBidWZbaV07XHJcbiAgICAgICAgICAgICsrcmV0dmFsW3Bvc19jdHJdO1xyXG4gICAgICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbbGVuKytdID0gdmFsO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcG9zX2N0ciA9IGxlbisrO1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW3Bvc19jdHJdID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0dmFsLnN1YmFycmF5KDAsIGxlbikuc2xpY2UoKS5idWZmZXI7XHJcbiAgICB9O1xyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdjb21tYW5kTG9nJywgY29tbWFuZExvZyk7XHJcblxyXG4gICAgY29tbWFuZExvZy4kaW5qZWN0ID0gWyckcSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNvbW1hbmRMb2coJHEpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZXMgPSBbXTtcclxuICAgICAgICB2YXIgcmVzcG9uZGVyID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgdmFyIHNlcnZpY2UgPSBsb2c7XHJcbiAgICAgICAgc2VydmljZS5sb2cgPSBsb2c7XHJcbiAgICAgICAgc2VydmljZS5jbGVhclN1YnNjcmliZXJzID0gY2xlYXJTdWJzY3JpYmVycztcclxuICAgICAgICBzZXJ2aWNlLm9uTWVzc2FnZSA9IG9uTWVzc2FnZTtcclxuICAgICAgICBzZXJ2aWNlLnJlYWQgPSByZWFkO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VydmljZTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbG9nKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIHJlc3BvbmRlci5ub3RpZnkocmVhZCgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVhZCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2xlYXJTdWJzY3JpYmVycygpIHtcclxuICAgICAgICAgICAgcmVzcG9uZGVyID0gJHEuZGVmZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uTWVzc2FnZShjYWxsYmFjaykge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uZGVyLnByb21pc2UudGhlbih1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnZGV2aWNlQ29uZmlnJywgZGV2aWNlQ29uZmlnKTtcclxuXHJcbiAgICBkZXZpY2VDb25maWcuJGluamVjdCA9IFsnc2VyaWFsJywgJ2NvbW1hbmRMb2cnLCAnZmlybXdhcmVWZXJzaW9uJywgJ3NlcmlhbGl6YXRpb25IYW5kbGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gZGV2aWNlQ29uZmlnKHNlcmlhbCwgY29tbWFuZExvZywgZmlybXdhcmVWZXJzaW9uLCBzZXJpYWxpemF0aW9uSGFuZGxlcikge1xyXG4gICAgICAgIHZhciBjb25maWc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdObyBjYWxsYmFjayBkZWZpbmVkIGZvciByZWNlaXZpbmcgY29uZmlndXJhdGlvbnMhJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGxvZ2dpbmdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgJ05vIGNhbGxiYWNrIGRlZmluZWQgZm9yIHJlY2VpdmluZyBsb2dnaW5nIHN0YXRlIScgK1xyXG4gICAgICAgICAgICAgICAgJyBDYWxsYmFjayBhcmd1bWVudHM6IChpc0xvZ2dpbmcsIGlzTG9ja2VkLCBkZWxheSknKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZXJpYWwuYWRkT25SZWNlaXZlQ2FsbGJhY2soZnVuY3Rpb24obWVzc2FnZVR5cGUsIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlICE9PSAnQ29tbWFuZCcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3NldF9lZXByb21fZGF0YScgaW4gbWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlQ29uZmlnRnJvbVJlbW90ZURhdGEobWVzc2FnZS5zZXRfZWVwcm9tX2RhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgnc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGEnIGluIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUNvbmZpZ0Zyb21SZW1vdGVEYXRhKG1lc3NhZ2Uuc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgoJ3NldF9jYXJkX3JlY29yZGluZ19zdGF0ZScgaW4gbWVzc2FnZSkgJiYgKCdzZXRfc2Rfd3JpdGVfZGVsYXknIGluIG1lc3NhZ2UpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2FyZF9yZWNfc3RhdGUgPSBtZXNzYWdlLnNldF9jYXJkX3JlY29yZGluZ19zdGF0ZTtcclxuICAgICAgICAgICAgICAgIHZhciBzZF93cml0ZV9kZWxheSA9IG1lc3NhZ2Uuc2V0X3NkX3dyaXRlX2RlbGF5O1xyXG4gICAgICAgICAgICAgICAgbG9nZ2luZ0NhbGxiYWNrKGNhcmRfcmVjX3N0YXRlLnJlY29yZF90b19jYXJkLCBjYXJkX3JlY19zdGF0ZS5sb2NrX3JlY29yZGluZ19zdGF0ZSwgc2Rfd3JpdGVfZGVsYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldERlc2lyZWRWZXJzaW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmlybXdhcmVWZXJzaW9uLmRlc2lyZWQoKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZXF1ZXN0KCkge1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlcnMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKTtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnUmVxdWVzdGluZyBjdXJyZW50IGNvbmZpZ3VyYXRpb24gZGF0YS4uLicpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6IGhhbmRsZXJzLkNvbmZpZ3VyYXRpb25GbGFnLmVtcHR5KCksXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlaW5pdCgpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnU2V0dGluZyBmYWN0b3J5IGRlZmF1bHQgY29uZmlndXJhdGlvbiBkYXRhLi4uJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZWluaXRfZWVwcm9tX2RhdGE6IHRydWUsXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdSZXF1ZXN0IGZvciBmYWN0b3J5IHJlc2V0IGZhaWxlZDogJyArIHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kKG5ld0NvbmZpZykge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VuZENvbmZpZyh7IGNvbmZpZzogbmV3Q29uZmlnLCB0ZW1wb3Jhcnk6IGZhbHNlLCByZXF1ZXN0VXBkYXRlOiB0cnVlIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZENvbmZpZyhwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVycyA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpO1xyXG4gICAgICAgICAgICB2YXIgbWFzayA9IHByb3BlcnRpZXMubWFzayB8fCBoYW5kbGVycy5Db25maWd1cmF0aW9uRmxhZy5lbXB0eSgpO1xyXG4gICAgICAgICAgICB2YXIgbmV3Q29uZmlnID0gcHJvcGVydGllcy5jb25maWcgfHwgY29uZmlnO1xyXG4gICAgICAgICAgICB2YXIgcmVxdWVzdFVwZGF0ZSA9IHByb3BlcnRpZXMucmVxdWVzdFVwZGF0ZSB8fCBmYWxzZTtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAocHJvcGVydGllcy50ZW1wb3JhcnkpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0X3BhcnRpYWxfdGVtcG9yYXJ5X2NvbmZpZyA9IG5ld0NvbmZpZztcclxuICAgICAgICAgICAgICAgIG1hc2sgPSB7IHNldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWc6IG1hc2sgfTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGEgPSBuZXdDb25maWc7XHJcbiAgICAgICAgICAgICAgICBtYXNrID0geyBzZXRfcGFydGlhbF9lZXByb21fZGF0YTogbWFzayB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIG1lc3NhZ2UsIHRydWUsIG1hc2spLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdFVwZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVDb25maWdGcm9tUmVtb3RlRGF0YShjb25maWdDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIC8vY29tbWFuZExvZygnUmVjZWl2ZWQgY29uZmlnIScpO1xyXG4gICAgICAgICAgICBjb25maWcgPSBzZXJpYWxpemF0aW9uSGFuZGxlci51cGRhdGVGaWVsZHMoY29uZmlnLCBjb25maWdDaGFuZ2VzKTtcclxuICAgICAgICAgICAgdmFyIHZlcnNpb24gPSBbY29uZmlnLnZlcnNpb24ubWFqb3IsIGNvbmZpZy52ZXJzaW9uLm1pbm9yLCBjb25maWcudmVyc2lvbi5wYXRjaF07XHJcbiAgICAgICAgICAgIGZpcm13YXJlVmVyc2lvbi5zZXQodmVyc2lvbik7XHJcbiAgICAgICAgICAgIGlmICghZmlybXdhcmVWZXJzaW9uLnN1cHBvcnRlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdSZWNlaXZlZCBhbiB1bnN1cHBvcnRlZCBjb25maWd1cmF0aW9uIScpO1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICAgICAnRm91bmQgdmVyc2lvbjogJyArIHZlcnNpb25bMF0gKyAnLicgKyB2ZXJzaW9uWzFdICsgJy4nICsgdmVyc2lvblsyXSAgK1xyXG4gICAgICAgICAgICAgICAgICAgICcgLS0tIE5ld2VzdCB2ZXJzaW9uOiAnICtcclxuICAgICAgICAgICAgICAgICAgICBmaXJtd2FyZVZlcnNpb24uZGVzaXJlZEtleSgpICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICdSZWNlaXZlZCBjb25maWd1cmF0aW9uIGRhdGEgKHYnICtcclxuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uWzBdICsgJy4nICsgdmVyc2lvblsxXSArICcuJyArIHZlcnNpb25bMl0gKycpJyk7XHJcbiAgICAgICAgICAgICAgICBjb25maWdDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRDb25maWdDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBjb25maWdDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0TG9nZ2luZ0NhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGxvZ2dpbmdDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0Q29uZmlnKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uZmlnID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCkuQ29uZmlndXJhdGlvbi5lbXB0eSgpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXF1ZXN0OiByZXF1ZXN0LFxyXG4gICAgICAgICAgICByZWluaXQ6IHJlaW5pdCxcclxuICAgICAgICAgICAgc2VuZDogc2VuZCxcclxuICAgICAgICAgICAgc2VuZENvbmZpZzogc2VuZENvbmZpZyxcclxuICAgICAgICAgICAgZ2V0Q29uZmlnOiBnZXRDb25maWcsXHJcbiAgICAgICAgICAgIHNldENvbmZpZ0NhbGxiYWNrOiBzZXRDb25maWdDYWxsYmFjayxcclxuICAgICAgICAgICAgc2V0TG9nZ2luZ0NhbGxiYWNrOiBzZXRMb2dnaW5nQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGdldERlc2lyZWRWZXJzaW9uOiBnZXREZXNpcmVkVmVyc2lvbixcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnZGV2aWNlQ29uZmlnUGFyc2VyJywgZGV2aWNlQ29uZmlnUGFyc2VyKTtcclxuXHJcbiAgICBkZXZpY2VDb25maWdQYXJzZXIuJGluamVjdCA9IFtdO1xyXG5cclxuICAgIGZ1bmN0aW9uIGRldmljZUNvbmZpZ1BhcnNlcigpIHtcclxuICAgICAgICB2YXIgY29uc3RhbnRzID0ge307XHJcblxyXG4gICAgICAgIHZhciBwYXR0ZXJucyA9IHtcclxuICAgICAgICAgICAgbm9uZTogMCxcclxuICAgICAgICAgICAgc29saWQ6IDUsXHJcbiAgICAgICAgICAgIGZsYXNoOiAxLFxyXG4gICAgICAgICAgICBicmVhdGhlOiAzLFxyXG4gICAgICAgICAgICBiZWFjb246IDIsXHJcbiAgICAgICAgICAgIGFsdGVybmF0ZTogNCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBPYmplY3Qua2V5cyhwYXR0ZXJucykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIGNvbnN0YW50c1snUEFUVEVSTl8nICsga2V5XSA9IEpTT04uc3RyaW5naWZ5KHBhdHRlcm5zW2tleV0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgY29sb3JfcGFsZXR0ZSA9IHtcclxuICAgICAgICAgICAgUGxhaWQ6IHtyZWQ6IDIwNCwgZ3JlZW46IDg1LCBibHVlOiA1MX0sXHJcbiAgICAgICAgICAgIERhcmtNYWdlbnRhOiB7cmVkOiAxMzksIGdyZWVuOiAwLCBibHVlOiAxMzl9LFxyXG4gICAgICAgICAgICBSZWQ6IHtyZWQ6IDI1NSwgZ3JlZW46IDAsIGJsdWU6IDB9LFxyXG4gICAgICAgICAgICBPcmFuZ2VSZWQ6IHtyZWQ6IDI1NSwgZ3JlZW46IDY5LCBibHVlOiAwfSxcclxuICAgICAgICAgICAgT3JhbmdlOiB7cmVkOiAyNTUsIGdyZWVuOiAxNjUsIGJsdWU6IDB9LFxyXG4gICAgICAgICAgICBZZWxsb3c6IHtyZWQ6IDI1NSwgZ3JlZW46IDI1NSwgYmx1ZTogMH0sXHJcbiAgICAgICAgICAgIFdoaXRlOiB7cmVkOiAyNTUsIGdyZWVuOiAyNTUsIGJsdWU6IDI1NX0sXHJcbiAgICAgICAgICAgIEJsYWNrOiB7cmVkOiAwLCBncmVlbjogMCwgYmx1ZTogMH0sXHJcbiAgICAgICAgICAgIEJsdWU6IHtyZWQ6IDAsIGdyZWVuOiAwLCBibHVlOiAyNTV9LFxyXG4gICAgICAgICAgICBMaWdodFNlYUdyZWVuOiB7cmVkOiAzMiwgZ3JlZW46IDE3OCwgYmx1ZTogMTcwfSxcclxuICAgICAgICAgICAgR3JlZW46IHtyZWQ6IDAsIGdyZWVuOiAxMjgsIGJsdWU6IDB9LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVuaWZvcm1GYWRlZENvbG9yKGMpIHtcclxuICAgICAgICAgICAgdmFyIHNjYWxlID0gKDI1Ni4wIC0gMjMwLjApIC8gMjU2LjA7IC8vIG1hdGNoZXMgZmFkZSBmdW5jdGlvbiBpbiBmaXJtd2FyZVxyXG4gICAgICAgICAgICB2YXIgciA9IE1hdGgubWF4KDAsIE1hdGgubWluKDI1NSwgTWF0aC5yb3VuZChzY2FsZSAqIGMucmVkKSkpO1xyXG4gICAgICAgICAgICB2YXIgZyA9IE1hdGgubWF4KDAsIE1hdGgubWluKDI1NSwgTWF0aC5yb3VuZChzY2FsZSAqIGMuZ3JlZW4pKSk7XHJcbiAgICAgICAgICAgIHZhciBiID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMjU1LCBNYXRoLnJvdW5kKHNjYWxlICogYy5ibHVlKSkpO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcmlnaHRfZnJvbnQ6IHtyZWQ6IHIsIGdyZWVuOiBnLCBibHVlOiBifSxcclxuICAgICAgICAgICAgICAgIHJpZ2h0X2JhY2s6IHtyZWQ6IHIsIGdyZWVuOiBnLCBibHVlOiBifSxcclxuICAgICAgICAgICAgICAgIGxlZnRfZnJvbnQ6IHtyZWQ6IHIsIGdyZWVuOiBnLCBibHVlOiBifSxcclxuICAgICAgICAgICAgICAgIGxlZnRfYmFjazoge3JlZDogciwgZ3JlZW46IGcsIGJsdWU6IGJ9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBPYmplY3Qua2V5cyhjb2xvcl9wYWxldHRlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgY29uc3RhbnRzWydDT0xPUl8nICsga2V5XSA9IEpTT04uc3RyaW5naWZ5KHVuaWZvcm1GYWRlZENvbG9yKGNvbG9yX3BhbGV0dGVba2V5XSkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdGFudHNbJ0xFRF91bnVzZWRfbW9kZSddID0gJ3tzdGF0dXM6e30scGF0dGVybjonICsgY29uc3RhbnRzLlBBVFRFUk5fbm9uZSArICcsY29sb3JzOicgKyBjb25zdGFudHMuQ09MT1JfQmxhY2sgKyAnaW5kaWNhdG9yX3JlZDpmYWxzZSxpbmRpY2F0b3JfZ3JlZW46ZmFsc2V9JztcclxuXHJcbiAgICAgICAgdmFyIHJlZ2V4ID0gL1wiXFwkeyhcXHcrKX1cIi9nO1xyXG5cclxuICAgICAgICB2YXIgY29uc3RfZmlsbGVyID0gZnVuY3Rpb24gKGZ1bGxfbWF0Y2gsIGxhYmVsKSB7XHJcbiAgICAgICAgICAgIGlmIChsYWJlbCBpbiBjb25zdGFudHMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjb25zdGFudHNbbGFiZWxdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29uc3RhbnQgXCInICsgbGFiZWwgKyAnXCIgaXMgbm90IHN1cHBvcnRlZCBieSB0aGlzIHZlcnNpb24gb2YgZmx5YnJpeC1jb21tb24uJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIHBhcnNlID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YS5yZXBsYWNlKHJlZ2V4LCBjb25zdF9maWxsZXIpKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4ge3BhcnNlOiBwYXJzZX07XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2Zpcm13YXJlVmVyc2lvbicsIGZpcm13YXJlVmVyc2lvbik7XHJcblxyXG4gICAgZmlybXdhcmVWZXJzaW9uLiRpbmplY3QgPSBbJ3NlcmlhbGl6YXRpb25IYW5kbGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gZmlybXdhcmVWZXJzaW9uKHNlcmlhbGl6YXRpb25IYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIHZlcnNpb24gPSBbMCwgMCwgMF07XHJcbiAgICAgICAgdmFyIGtleSA9ICcwLjAuMCc7XHJcblxyXG4gICAgICAgIHZhciBuZXdlc3RWZXJzaW9uID0gc2VyaWFsaXphdGlvbkhhbmRsZXIuZ2V0TmV3ZXN0VmVyc2lvbigpO1xyXG5cclxuICAgICAgICB2YXIgZGVzaXJlZCA9IFtuZXdlc3RWZXJzaW9uLm1ham9yLCBuZXdlc3RWZXJzaW9uLm1pbm9yLCBuZXdlc3RWZXJzaW9uLnBhdGNoXTtcclxuICAgICAgICB2YXIgZGVzaXJlZEtleSA9IGRlc2lyZWRbMF0udG9TdHJpbmcoKSArICcuJyArIGRlc2lyZWRbMV0udG9TdHJpbmcoKSArICcuJyArIGRlc2lyZWRbMl0udG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgdmFyIGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlciA9IHNlcmlhbGl6YXRpb25IYW5kbGVyLmdldEhhbmRsZXIoZGVzaXJlZEtleSk7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlciA9IGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAga2V5ID0gdmFsdWUuam9pbignLicpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFNlcmlhbGl6YXRpb25IYW5kbGVyID1cclxuICAgICAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uSGFuZGxlci5nZXRIYW5kbGVyKGRlc2lyZWRLZXkpIHx8IGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBrZXk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGtleTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3VwcG9ydGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhIXNlcmlhbGl6YXRpb25IYW5kbGVyLmdldEhhbmRsZXIoa2V5KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVzaXJlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzaXJlZDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVzaXJlZEtleTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzaXJlZEtleTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbkhhbmRsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2xlZCcsIGxlZCk7XHJcblxyXG4gICAgbGVkLiRpbmplY3QgPSBbJyRxJywgJ3NlcmlhbCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGxlZCgkcSwgc2VyaWFsKSB7XHJcbiAgICAgICAgdmFyIExlZFBhdHRlcm5zID0ge1xyXG4gICAgICAgICAgICBOT19PVkVSUklERTogMCxcclxuICAgICAgICAgICAgRkxBU0g6IDEsXHJcbiAgICAgICAgICAgIEJFQUNPTjogMixcclxuICAgICAgICAgICAgQlJFQVRIRTogMyxcclxuICAgICAgICAgICAgQUxURVJOQVRFOiA0LFxyXG4gICAgICAgICAgICBTT0xJRDogNSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgdXJnZW50ID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGJsYWNrID0ge3JlZDogMCwgZ3JlZW46IDAsIGJsdWU6IDB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXQocmlnaHRfZnJvbnQsIHJpZ2h0X2JhY2ssIGxlZnRfZnJvbnQsIGxlZnRfYmFjaywgcGF0dGVybiwgcmVkLCBncmVlbikge1xyXG4gICAgICAgICAgICBpZiAoIXVyZ2VudCAmJiBzZXJpYWwuYnVzeSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KCdTZXJpYWwgY29ubmVjdGlvbiBpcyB0b28gYnVzeScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHVyZ2VudCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgcGF0dGVybiA9IHBhdHRlcm4gfHwgTGVkUGF0dGVybnMuTk9fT1ZFUlJJREU7XHJcbiAgICAgICAgICAgIGlmIChwYXR0ZXJuIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgcGF0dGVybiA9IExlZFBhdHRlcm5zLk5PX09WRVJSSURFO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhdHRlcm4gPiA1KSB7XHJcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gTGVkUGF0dGVybnMuU09MSUQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBzZXR0ZXJfY29tbWFuZCA9IHtcclxuICAgICAgICAgICAgICAgIHBhdHRlcm46IHBhdHRlcm4sXHJcbiAgICAgICAgICAgICAgICBjb2xvcl9yaWdodDogcmlnaHRfZnJvbnQgfHwgYmxhY2ssXHJcbiAgICAgICAgICAgICAgICBjb2xvcl9sZWZ0OiBsZWZ0X2Zyb250IHx8IGJsYWNrLFxyXG4gICAgICAgICAgICAgICAgY29sb3JfcmlnaHRfZnJvbnQ6IHJpZ2h0X2Zyb250IHx8IGJsYWNrLFxyXG4gICAgICAgICAgICAgICAgY29sb3JfbGVmdF9mcm9udDogbGVmdF9mcm9udCB8fCBibGFjayxcclxuICAgICAgICAgICAgICAgIGNvbG9yX3JpZ2h0X2JhY2s6IHJpZ2h0X2JhY2sgfHwgYmxhY2ssXHJcbiAgICAgICAgICAgICAgICBjb2xvcl9sZWZ0X2JhY2s6IGxlZnRfYmFjayB8fCBibGFjayxcclxuICAgICAgICAgICAgICAgIGluZGljYXRvcl9yZWQ6IHJlZCxcclxuICAgICAgICAgICAgICAgIGluZGljYXRvcl9ncmVlbjogZ3JlZW4sXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2xlZDogc2V0dGVyX2NvbW1hbmQsXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFNpbXBsZShyZWQsIGdyZWVuLCBibHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2xvciA9IHtyZWQ6IHJlZCB8fCAwLCBncmVlbjogZ3JlZW4gfHwgMCwgYmx1ZTogYmx1ZSB8fCAwfTtcclxuICAgICAgICAgICAgcmV0dXJuIHNldChjb2xvciwgY29sb3IsIGNvbG9yLCBjb2xvciwgTGVkUGF0dGVybnMuU09MSUQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2xlYXIoKSB7XHJcbiAgICAgICAgICAgIGZvcmNlTmV4dFNlbmQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNldCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZm9yY2VOZXh0U2VuZCgpIHtcclxuICAgICAgICAgICAgdXJnZW50ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNldDogc2V0LFxyXG4gICAgICAgICAgICBzZXRTaW1wbGU6IHNldFNpbXBsZSxcclxuICAgICAgICAgICAgY2xlYXI6IGNsZWFyLFxyXG4gICAgICAgICAgICBwYXR0ZXJuczogTGVkUGF0dGVybnMsXHJcbiAgICAgICAgICAgIGZvcmNlTmV4dFNlbmQ6IGZvcmNlTmV4dFNlbmQsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3JjRGF0YScsIHJjRGF0YSk7XHJcblxyXG4gICAgcmNEYXRhLiRpbmplY3QgPSBbJ3NlcmlhbCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJjRGF0YShzZXJpYWwpIHtcclxuICAgICAgICB2YXIgQVVYID0ge1xyXG4gICAgICAgICAgICBMT1c6IDAsXHJcbiAgICAgICAgICAgIE1JRDogMSxcclxuICAgICAgICAgICAgSElHSDogMixcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBhdXhOYW1lcyA9IFsnbG93JywgJ21pZCcsICdoaWdoJ107XHJcblxyXG4gICAgICAgIHZhciB0aHJvdHRsZSA9IC0xO1xyXG4gICAgICAgIHZhciBwaXRjaCA9IDA7XHJcbiAgICAgICAgdmFyIHJvbGwgPSAwO1xyXG4gICAgICAgIHZhciB5YXcgPSAwO1xyXG4gICAgICAgIC8vIGRlZmF1bHRzIHRvIGhpZ2ggLS0gbG93IGlzIGVuYWJsaW5nOyBoaWdoIGlzIGRpc2FibGluZ1xyXG4gICAgICAgIHZhciBhdXgxID0gQVVYLkhJR0g7XHJcbiAgICAgICAgLy8gZGVmYXVsdHMgdG8gPz8gLS0gbmVlZCB0byBjaGVjayB0cmFuc21pdHRlciBiZWhhdmlvclxyXG4gICAgICAgIHZhciBhdXgyID0gQVVYLkhJR0g7XHJcblxyXG4gICAgICAgIHZhciB1cmdlbnQgPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzZXRUaHJvdHRsZTogc2V0VGhyb3R0bGUsXHJcbiAgICAgICAgICAgIHNldFBpdGNoOiBzZXRQaXRjaCxcclxuICAgICAgICAgICAgc2V0Um9sbDogc2V0Um9sbCxcclxuICAgICAgICAgICAgc2V0WWF3OiBzZXRZYXcsXHJcbiAgICAgICAgICAgIHNldEF1eDE6IHNldEF1eDEsXHJcbiAgICAgICAgICAgIHNldEF1eDI6IHNldEF1eDIsXHJcbiAgICAgICAgICAgIGdldFRocm90dGxlOiBnZXRUaHJvdHRsZSxcclxuICAgICAgICAgICAgZ2V0UGl0Y2g6IGdldFBpdGNoLFxyXG4gICAgICAgICAgICBnZXRSb2xsOiBnZXRSb2xsLFxyXG4gICAgICAgICAgICBnZXRZYXc6IGdldFlhdyxcclxuICAgICAgICAgICAgZ2V0QXV4MTogZ2V0QXV4MSxcclxuICAgICAgICAgICAgZ2V0QXV4MjogZ2V0QXV4MixcclxuICAgICAgICAgICAgQVVYOiBBVVgsXHJcbiAgICAgICAgICAgIHNlbmQ6IHNlbmQsXHJcbiAgICAgICAgICAgIGZvcmNlTmV4dFNlbmQ6IGZvcmNlTmV4dFNlbmQsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZCgpIHtcclxuICAgICAgICAgICAgaWYgKCF1cmdlbnQgJiYgc2VyaWFsLmJ1c3koKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHVyZ2VudCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbW1hbmQgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vIGludmVydCBwaXRjaCBhbmQgcm9sbFxyXG4gICAgICAgICAgICB2YXIgdGhyb3R0bGVfdGhyZXNob2xkID1cclxuICAgICAgICAgICAgICAgIC0wLjg7ICAvLyBrZWVwIGJvdHRvbSAxMCUgb2YgdGhyb3R0bGUgc3RpY2sgdG8gbWVhbiAnb2ZmJ1xyXG4gICAgICAgICAgICBjb21tYW5kLnRocm90dGxlID0gY29uc3RyYWluKFxyXG4gICAgICAgICAgICAgICAgKHRocm90dGxlIC0gdGhyb3R0bGVfdGhyZXNob2xkKSAqIDQwOTUgL1xyXG4gICAgICAgICAgICAgICAgICAgICgxIC0gdGhyb3R0bGVfdGhyZXNob2xkKSxcclxuICAgICAgICAgICAgICAgIDAsIDQwOTUpO1xyXG4gICAgICAgICAgICBjb21tYW5kLnBpdGNoID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigtKGFwcGx5RGVhZHpvbmUocGl0Y2gsIDAuMSkpICogNDA5NSAvIDIsIC0yMDQ3LCAyMDQ3KTtcclxuICAgICAgICAgICAgY29tbWFuZC5yb2xsID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigoYXBwbHlEZWFkem9uZShyb2xsLCAwLjEpKSAqIDQwOTUgLyAyLCAtMjA0NywgMjA0Nyk7XHJcbiAgICAgICAgICAgIGNvbW1hbmQueWF3ID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigtKGFwcGx5RGVhZHpvbmUoeWF3LCAwLjEpKSAqIDQwOTUgLyAyLCAtMjA0NywgMjA0Nyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYXV4X21hc2sgPSB7fTtcclxuICAgICAgICAgICAgLy8gYXV4MV9sb3csIGF1eDFfbWlkLCBhdXgxX2hpZ2gsIGFuZCBzYW1lIHdpdGggYXV4MlxyXG4gICAgICAgICAgICBhdXhfbWFza1snYXV4MV8nICsgYXV4TmFtZXNbYXV4MV1dID0gdHJ1ZTtcclxuICAgICAgICAgICAgYXV4X21hc2tbJ2F1eDJfJyArIGF1eE5hbWVzW2F1eDJdXSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X3NlcmlhbF9yYzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogY29tbWFuZCxcclxuICAgICAgICAgICAgICAgICAgICBhdXhfbWFzazogYXV4X21hc2ssXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRUaHJvdHRsZSh2KSB7XHJcbiAgICAgICAgICAgIHRocm90dGxlID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFBpdGNoKHYpIHtcclxuICAgICAgICAgICAgcGl0Y2ggPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Um9sbCh2KSB7XHJcbiAgICAgICAgICAgIHJvbGwgPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0WWF3KHYpIHtcclxuICAgICAgICAgICAgeWF3ID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEF1eDEodikge1xyXG4gICAgICAgICAgICBhdXgxID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMiwgdikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0QXV4Mih2KSB7XHJcbiAgICAgICAgICAgIGF1eDIgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigyLCB2KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRUaHJvdHRsZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRocm90dGxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UGl0Y2goKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwaXRjaDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJvbGwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByb2xsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0WWF3KCkge1xyXG4gICAgICAgICAgICByZXR1cm4geWF3O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0QXV4MSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGF1eDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRBdXgyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXV4MjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGZvcmNlTmV4dFNlbmQoKSB7XHJcbiAgICAgICAgICAgIHVyZ2VudCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjb25zdHJhaW4oeCwgeG1pbiwgeG1heCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5tYXgoeG1pbiwgTWF0aC5taW4oeCwgeG1heCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYXBwbHlEZWFkem9uZSh2YWx1ZSwgZGVhZHpvbmUpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID4gZGVhZHpvbmUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAtIGRlYWR6b25lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA8IC1kZWFkem9uZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgZGVhZHpvbmU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdzZXJpYWwnLCBzZXJpYWwpO1xyXG5cclxuICAgIHNlcmlhbC4kaW5qZWN0ID0gWyckdGltZW91dCcsICckcScsICdjb2JzJywgJ2NvbW1hbmRMb2cnLCAnZmlybXdhcmVWZXJzaW9uJywgJ3NlcmlhbGl6YXRpb25IYW5kbGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gc2VyaWFsKCR0aW1lb3V0LCAkcSwgY29icywgY29tbWFuZExvZywgZmlybXdhcmVWZXJzaW9uLCBzZXJpYWxpemF0aW9uSGFuZGxlcikge1xyXG4gICAgICAgIHZhciBNZXNzYWdlVHlwZSA9IHtcclxuICAgICAgICAgICAgU3RhdGU6IDAsXHJcbiAgICAgICAgICAgIENvbW1hbmQ6IDEsXHJcbiAgICAgICAgICAgIERlYnVnU3RyaW5nOiAzLFxyXG4gICAgICAgICAgICBIaXN0b3J5RGF0YTogNCxcclxuICAgICAgICAgICAgUHJvdG9jb2w6IDEyOCxcclxuICAgICAgICAgICAgUmVzcG9uc2U6IDI1NSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgYWNrbm93bGVkZ2VzID0gW107XHJcbiAgICAgICAgdmFyIGJhY2tlbmQgPSBuZXcgQmFja2VuZCgpO1xyXG5cclxuICAgICAgICB2YXIgb25SZWNlaXZlTGlzdGVuZXJzID0gW107XHJcblxyXG4gICAgICAgIHZhciBjb2JzUmVhZGVyID0gbmV3IGNvYnMuUmVhZGVyKDEwMDAwKTtcclxuICAgICAgICB2YXIgYnl0ZXNIYW5kbGVyID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBCYWNrZW5kKCkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmFja2VuZC5wcm90b3R5cGUuYnVzeSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgQmFja2VuZC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gXCJzZW5kXCIgZGVmaW5lZCBmb3Igc2VyaWFsIGJhY2tlbmQnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBCYWNrZW5kLnByb3RvdHlwZS5vblJlYWQgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ05vIFwib25SZWFkXCIgZGVmaW5lZCBmb3Igc2VyaWFsIGJhY2tlbmQnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgTWVzc2FnZVR5cGVJbnZlcnNpb24gPSBbXTtcclxuICAgICAgICBPYmplY3Qua2V5cyhNZXNzYWdlVHlwZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgTWVzc2FnZVR5cGVJbnZlcnNpb25bTWVzc2FnZVR5cGVba2V5XV0gPSBrZXk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGFkZE9uUmVjZWl2ZUNhbGxiYWNrKGZ1bmN0aW9uKG1lc3NhZ2VUeXBlLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSA9PT0gJ1Jlc3BvbnNlJykge1xyXG4gICAgICAgICAgICAgICAgYWNrbm93bGVkZ2UobWVzc2FnZS5tYXNrLCBtZXNzYWdlLmFjayk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZVR5cGUgPT09ICdQcm90b2NvbCcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gbWVzc2FnZS5yZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsaXphdGlvbkhhbmRsZXIuYWRkSGFuZGxlcihkYXRhLnZlcnNpb24sIGRhdGEuc3RydWN0dXJlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBidXN5OiBidXN5LFxyXG4gICAgICAgICAgICBzZW5kU3RydWN0dXJlOiBzZW5kU3RydWN0dXJlLFxyXG4gICAgICAgICAgICBzZXRCYWNrZW5kOiBzZXRCYWNrZW5kLFxyXG4gICAgICAgICAgICBhZGRPblJlY2VpdmVDYWxsYmFjazogYWRkT25SZWNlaXZlQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHJlbW92ZU9uUmVjZWl2ZUNhbGxiYWNrOiByZW1vdmVPblJlY2VpdmVDYWxsYmFjayxcclxuICAgICAgICAgICAgc2V0Qnl0ZXNIYW5kbGVyOiBzZXRCeXRlc0hhbmRsZXIsXHJcbiAgICAgICAgICAgIGhhbmRsZVBvc3RDb25uZWN0OiBoYW5kbGVQb3N0Q29ubmVjdCxcclxuICAgICAgICAgICAgQmFja2VuZDogQmFja2VuZCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRCYWNrZW5kKHYpIHtcclxuICAgICAgICAgICAgYmFja2VuZCA9IHY7XHJcbiAgICAgICAgICAgIGJhY2tlbmQub25SZWFkID0gcmVhZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVBvc3RDb25uZWN0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdEZpcm13YXJlVmVyc2lvbigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdEZpcm13YXJlVmVyc2lvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kU3RydWN0dXJlKG1lc3NhZ2VUeXBlLCBkYXRhLCBsb2dfc2VuZCwgZXh0cmFNYXNrKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSA9PT0gJ1N0YXRlJykge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHByb2Nlc3NTdGF0ZU91dHB1dChkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaGFuZGxlcnMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGlmICghKG1lc3NhZ2VUeXBlIGluIE1lc3NhZ2VUeXBlKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UucmVqZWN0KCdNZXNzYWdlIHR5cGUgXCInICsgbWVzc2FnZVR5cGUgK1xyXG4gICAgICAgICAgICAgICAgICAgICdcIiBub3Qgc3VwcG9ydGVkIGJ5IGFwcCwgc3VwcG9ydGVkIG1lc3NhZ2UgdHlwZXMgYXJlOicgK1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKE1lc3NhZ2VUeXBlKS5qb2luKCcsICcpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghKG1lc3NhZ2VUeXBlIGluIGhhbmRsZXJzKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UucmVqZWN0KCdNZXNzYWdlIHR5cGUgXCInICsgbWVzc2FnZVR5cGUgK1xyXG4gICAgICAgICAgICAgICAgICAgICdcIiBub3Qgc3VwcG9ydGVkIGJ5IGZpcm13YXJlLCBzdXBwb3J0ZWQgbWVzc2FnZSB0eXBlcyBhcmU6JyArXHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoaGFuZGxlcnMpLmpvaW4oJywgJykpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHR5cGVDb2RlID0gTWVzc2FnZVR5cGVbbWVzc2FnZVR5cGVdO1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IGhhbmRsZXJzW21lc3NhZ2VUeXBlXTtcclxuXHJcbiAgICAgICAgICAgIHZhciBidWZmZXIgPSBuZXcgVWludDhBcnJheShoYW5kbGVyLmJ5dGVDb3VudCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2VyaWFsaXplciA9IG5ldyBzZXJpYWxpemF0aW9uSGFuZGxlci5TZXJpYWxpemVyKG5ldyBEYXRhVmlldyhidWZmZXIuYnVmZmVyKSk7XHJcbiAgICAgICAgICAgIGhhbmRsZXIuZW5jb2RlKHNlcmlhbGl6ZXIsIGRhdGEsIGV4dHJhTWFzayk7XHJcbiAgICAgICAgICAgIHZhciBtYXNrID0gaGFuZGxlci5tYXNrQXJyYXkoZGF0YSwgZXh0cmFNYXNrKTtcclxuICAgICAgICAgICAgaWYgKG1hc2subGVuZ3RoIDwgNSkge1xyXG4gICAgICAgICAgICAgICAgbWFzayA9IChtYXNrWzBdIDw8IDApIHwgKG1hc2tbMV0gPDwgOCkgfCAobWFza1syXSA8PCAxNikgfCAobWFza1szXSA8PCAyNCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBkYXRhTGVuZ3RoID0gc2VyaWFsaXplci5pbmRleDtcclxuXHJcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBuZXcgVWludDhBcnJheShkYXRhTGVuZ3RoICsgMyk7XHJcbiAgICAgICAgICAgIG91dHB1dFswXSA9IG91dHB1dFsxXSA9IHR5cGVDb2RlO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBkYXRhTGVuZ3RoOyArK2lkeCkge1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0WzBdIF49IG91dHB1dFtpZHggKyAyXSA9IGJ1ZmZlcltpZHhdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG91dHB1dFtkYXRhTGVuZ3RoICsgMl0gPSAwO1xyXG5cclxuICAgICAgICAgICAgYWNrbm93bGVkZ2VzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbWFzazogbWFzayxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGJhY2tlbmQuc2VuZChuZXcgVWludDhBcnJheShjb2JzLmVuY29kZShvdXRwdXQpKSk7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxvZ19zZW5kKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdTZW5kaW5nIGNvbW1hbmQgJyArIHR5cGVDb2RlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnByb21pc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBidXN5KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFja2VuZC5idXN5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRCeXRlc0hhbmRsZXIoaGFuZGxlcikge1xyXG4gICAgICAgICAgICBieXRlc0hhbmRsZXIgPSBoYW5kbGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVhZChkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChieXRlc0hhbmRsZXIpXHJcbiAgICAgICAgICAgICAgICBieXRlc0hhbmRsZXIoZGF0YSwgcHJvY2Vzc0RhdGEpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBjb2JzUmVhZGVyLnJlYWRCeXRlcyhkYXRhLCBwcm9jZXNzRGF0YSwgcmVwb3J0SXNzdWVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9ydElzc3Vlcyhpc3N1ZSwgdGV4dCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdDT0JTIGRlY29kaW5nIGZhaWxlZCAoJyArIGlzc3VlICsgJyk6ICcgKyB0ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFkZE9uUmVjZWl2ZUNhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIG9uUmVjZWl2ZUxpc3RlbmVycyA9IG9uUmVjZWl2ZUxpc3RlbmVycy5jb25jYXQoW2NhbGxiYWNrXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZW1vdmVPblJlY2VpdmVDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBvblJlY2VpdmVMaXN0ZW5lcnMgPSBvblJlY2VpdmVMaXN0ZW5lcnMuZmlsdGVyKGZ1bmN0aW9uKGNiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2IgIT09IGNhbGxiYWNrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFja25vd2xlZGdlKG1hc2ssIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHdoaWxlIChhY2tub3dsZWRnZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHYgPSBhY2tub3dsZWRnZXMuc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgIGlmICh2Lm1hc2sgXiBtYXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdi5yZXNwb25zZS5yZWplY3QoJ01pc3NpbmcgQUNLJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVsYXhlZE1hc2sgPSBtYXNrO1xyXG4gICAgICAgICAgICAgICAgcmVsYXhlZE1hc2sgJj0gfjE7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVsYXhlZE1hc2sgXiB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHYucmVzcG9uc2UucmVqZWN0KCdSZXF1ZXN0IHdhcyBub3QgZnVsbHkgcHJvY2Vzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2LnJlc3BvbnNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzRGF0YShieXRlcykge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZVR5cGUgPSBNZXNzYWdlVHlwZUludmVyc2lvbltieXRlc1swXV07XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKClbbWVzc2FnZVR5cGVdO1xyXG4gICAgICAgICAgICBpZiAoIW1lc3NhZ2VUeXBlIHx8ICFoYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdJbGxlZ2FsIG1lc3NhZ2UgdHlwZSBwYXNzZWQgZnJvbSBmaXJtd2FyZScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2VyaWFsaXplciA9IG5ldyBzZXJpYWxpemF0aW9uSGFuZGxlci5TZXJpYWxpemVyKG5ldyBEYXRhVmlldyhieXRlcy5idWZmZXIsIDEpKTtcclxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gaGFuZGxlci5kZWNvZGUoc2VyaWFsaXplcik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZygnVW5yZWNvZ25pemVkIG1lc3NhZ2UgZm9ybWF0IHJlY2VpdmVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlID09PSAnU3RhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gcHJvY2Vzc1N0YXRlSW5wdXQobWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb25SZWNlaXZlTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24obGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyKG1lc3NhZ2VUeXBlLCBtZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbGFzdF90aW1lc3RhbXBfdXMgPSAwO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzU3RhdGVJbnB1dChzdGF0ZSkge1xyXG4gICAgICAgICAgICBzdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlKTtcclxuICAgICAgICAgICAgdmFyIHNlcmlhbF91cGRhdGVfcmF0ZV9IeiA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoJ3RpbWVzdGFtcF91cycgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnNlcmlhbF91cGRhdGVfcmF0ZV9lc3RpbWF0ZSA9IDEwMDAwMDAgLyAoc3RhdGUudGltZXN0YW1wX3VzIC0gbGFzdF90aW1lc3RhbXBfdXMpO1xyXG4gICAgICAgICAgICAgICAgbGFzdF90aW1lc3RhbXBfdXMgPSBzdGF0ZS50aW1lc3RhbXBfdXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCd0ZW1wZXJhdHVyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlIC89IDEwMC4wOyAgLy8gdGVtcGVyYXR1cmUgZ2l2ZW4gaW4gQ2Vsc2l1cyAqIDEwMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgncHJlc3N1cmUnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5wcmVzc3VyZSAvPSAyNTYuMDsgIC8vIHByZXNzdXJlIGdpdmVuIGluIChRMjQuOCkgZm9ybWF0XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NTdGF0ZU91dHB1dChzdGF0ZSkge1xyXG4gICAgICAgICAgICBzdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlKTtcclxuICAgICAgICAgICAgaWYgKCd0ZW1wZXJhdHVyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlICo9IDEwMC4wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgncHJlc3N1cmUnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5wcmVzc3VyZSAqPSAyNTYuMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHNlcmlhbGl6YXRpb25IYW5kbGVyLiRpbmplY3QgPSBbJ2Rlc2NyaXB0b3JzSGFuZGxlcicsICdkZXZpY2VDb25maWdQYXJzZXInXTtcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3NlcmlhbGl6YXRpb25IYW5kbGVyJywgc2VyaWFsaXphdGlvbkhhbmRsZXIpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNlcmlhbGl6YXRpb25IYW5kbGVyKGRlc2NyaXB0b3JzSGFuZGxlciwgZGV2aWNlQ29uZmlnUGFyc2VyKSB7XHJcbiAgICAgICAgdmFyIGhhbmRsZXJDYWNoZSA9IHt9O1xyXG4gICAgICAgIHZhciBkZWZhdWx0c0NhY2hlID0ge307XHJcblxyXG4gICAgICAgIHZhciBuZXdlc3RWZXJzaW9uID0geyBtYWpvcjogMCwgbWlub3I6IDAsIHBhdGNoOiAwIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGlzTmV3ZXJWZXJzaW9uKHZlcnNpb24pIHtcclxuICAgICAgICAgICAgaWYgKHZlcnNpb24ubWFqb3IgIT09IG5ld2VzdFZlcnNpb24ubWFqb3IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uLm1ham9yID4gbmV3ZXN0VmVyc2lvbi5tYWpvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmVyc2lvbi5taW5vciAhPT0gbmV3ZXN0VmVyc2lvbi5taW5vcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZlcnNpb24ubWlub3IgPiBuZXdlc3RWZXJzaW9uLm1pbm9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uLnBhdGNoID4gbmV3ZXN0VmVyc2lvbi5wYXRjaDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHZlcnNpb25Ub1N0cmluZyh2ZXJzaW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uLm1ham9yLnRvU3RyaW5nKCkgKyAnLicgKyB2ZXJzaW9uLm1pbm9yLnRvU3RyaW5nKCkgKyAnLicgKyB2ZXJzaW9uLnBhdGNoLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzdHJpbmdUb1ZlcnNpb24odmVyc2lvbikge1xyXG4gICAgICAgICAgICB2YXIgcGFydHMgPSB2ZXJzaW9uLnNwbGl0KCcuJyk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBtYWpvcjogcGFyc2VJbnQocGFydHNbMF0pLFxyXG4gICAgICAgICAgICAgICAgbWlub3I6IHBhcnNlSW50KHBhcnRzWzFdKSxcclxuICAgICAgICAgICAgICAgIHBhdGNoOiBwYXJzZUludChwYXJ0c1syXSksXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhZGRIYW5kbGVyKHZlcnNpb24sIHN0cnVjdHVyZSwgZGVmYXVsdHMpIHtcclxuICAgICAgICAgICAgaWYgKGlzTmV3ZXJWZXJzaW9uKHZlcnNpb24pKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdlc3RWZXJzaW9uID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ham9yOiB2ZXJzaW9uLm1ham9yLFxyXG4gICAgICAgICAgICAgICAgICAgIG1pbm9yOiB2ZXJzaW9uLm1pbm9yLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhdGNoOiB2ZXJzaW9uLnBhdGNoLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdmVyc2lvblN0ciA9IHZlcnNpb25Ub1N0cmluZyh2ZXJzaW9uKTtcclxuICAgICAgICAgICAgaGFuZGxlckNhY2hlW3ZlcnNpb25TdHJdID0gRmx5YnJpeFNlcmlhbGl6YXRpb24ucGFyc2Uoc3RydWN0dXJlKTtcclxuICAgICAgICAgICAgZGVmYXVsdHNDYWNoZVt2ZXJzaW9uU3RyXSA9IGRldmljZUNvbmZpZ1BhcnNlci5wYXJzZShkZWZhdWx0cyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjb3B5SGFuZGxlcih2ZXJzaW9uLCBzcmNWZXJzaW9uKSB7XHJcbiAgICAgICAgICAgIGlmIChpc05ld2VyVmVyc2lvbih2ZXJzaW9uKSkge1xyXG4gICAgICAgICAgICAgICAgbmV3ZXN0VmVyc2lvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICBtYWpvcjogdmVyc2lvbi5tYWpvcixcclxuICAgICAgICAgICAgICAgICAgICBtaW5vcjogdmVyc2lvbi5taW5vcixcclxuICAgICAgICAgICAgICAgICAgICBwYXRjaDogdmVyc2lvbi5wYXRjaCxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHZlcnNpb25TdHIgPSB2ZXJzaW9uVG9TdHJpbmcodmVyc2lvbik7XHJcbiAgICAgICAgICAgIHZhciBzcmNWZXJzaW9uU3RyID0gdmVyc2lvblRvU3RyaW5nKHNyY1ZlcnNpb24pO1xyXG4gICAgICAgICAgICBoYW5kbGVyQ2FjaGVbdmVyc2lvblN0cl0gPSBoYW5kbGVyQ2FjaGVbc3JjVmVyc2lvblN0cl07XHJcbiAgICAgICAgICAgIGRlZmF1bHRzQ2FjaGVbdmVyc2lvblN0cl0gPSBkZWZhdWx0c0NhY2hlW3NyY1ZlcnNpb25TdHJdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGRlc2NWZXJzaW9ucyA9IGRlc2NyaXB0b3JzSGFuZGxlci52ZXJzaW9ucztcclxuICAgICAgICB2YXIgZGVzY0ZpbGVzID0gZGVzY3JpcHRvcnNIYW5kbGVyLmZpbGVzO1xyXG4gICAgICAgIHZhciBkZXNjUmV2ZXJzZU1hcCA9IHt9O1xyXG4gICAgICAgIE9iamVjdC5rZXlzKGRlc2NWZXJzaW9ucykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgdmFyIHZlcnMgPSBzdHJpbmdUb1ZlcnNpb24oa2V5KTtcclxuICAgICAgICAgICAgdmFyIGZpbGVuYW1lID0gZGVzY1ZlcnNpb25zW2tleV07XHJcbiAgICAgICAgICAgIGlmIChmaWxlbmFtZSBpbiBkZXNjUmV2ZXJzZU1hcCkge1xyXG4gICAgICAgICAgICAgICAgY29weUhhbmRsZXIodmVycywgZGVzY1JldmVyc2VNYXBbZmlsZW5hbWVdKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZmlsZW5hbWUgPSBkZXNjVmVyc2lvbnNba2V5XTtcclxuICAgICAgICAgICAgICAgIGFkZEhhbmRsZXIodmVycywgZGVzY0ZpbGVzW2ZpbGVuYW1lXSwgZGVzY0ZpbGVzW2ZpbGVuYW1lICsgJy5qc29uJ10pO1xyXG4gICAgICAgICAgICAgICAgZGVzY1JldmVyc2VNYXBbZmlsZW5hbWVdID0gdmVycztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVGaWVsZHModGFyZ2V0LCBzb3VyY2UpIHtcclxuICAgICAgICAgICAgLy8gSGFuZGxlIGFycmF5c1xyXG4gICAgICAgICAgICBpZiAoc291cmNlIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1cGRhdGVGaWVsZHNBcnJheSh0YXJnZXQsIHNvdXJjZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gSGFuZGxlIG9iamVjdHNcclxuICAgICAgICAgICAgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIE9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVwZGF0ZUZpZWxkc09iamVjdCh0YXJnZXQsIHNvdXJjZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gSGFuZGxlIGJvb2xzLCB0cmVhdGluZyBib3RoIGZhbHNlIGFuZCBtaXNzaW5nIGZpZWxkcyBhcyBmYWxzZVxyXG4gICAgICAgICAgICBpZiAodGFyZ2V0ID09PSB0cnVlICYmICFzb3VyY2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBJZiBuZXcgZGF0YSBpcyBtaXNzaW5nLCB1c2UgdGhlIG9sZCBkYXRhXHJcbiAgICAgICAgICAgIGlmIChzb3VyY2UgPT09IG51bGwgfHwgc291cmNlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUZpZWxkc09iamVjdCh0YXJnZXQsIHNvdXJjZSkge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHRhcmdldCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHVwZGF0ZUZpZWxkcyh0YXJnZXRba2V5XSwgc291cmNlW2tleV0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChrZXkgaW4gcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB1cGRhdGVGaWVsZHModGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVGaWVsZHNBcnJheSh0YXJnZXQsIHNvdXJjZSkge1xyXG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgodGFyZ2V0Lmxlbmd0aCwgc291cmNlLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgbGVuZ3RoOyArK2lkeCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godXBkYXRlRmllbGRzKHRhcmdldFtpZHhdLCBzb3VyY2VbaWR4XSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBTZXJpYWxpemVyOiBGbHlicml4U2VyaWFsaXphdGlvbi5TZXJpYWxpemVyLFxyXG4gICAgICAgICAgICBnZXREZWZhdWx0czogZnVuY3Rpb24gKGZpcm13YXJlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmYXVsdHNDYWNoZVtmaXJtd2FyZV07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldEhhbmRsZXI6IGZ1bmN0aW9uIChmaXJtd2FyZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXJDYWNoZVtmaXJtd2FyZV07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldE5ld2VzdFZlcnNpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXdlc3RWZXJzaW9uO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZGRIYW5kbGVyOiBhZGRIYW5kbGVyLFxyXG4gICAgICAgICAgICBjb3B5SGFuZGxlcjogY29weUhhbmRsZXIsXHJcbiAgICAgICAgICAgIHVwZGF0ZUZpZWxkczogdXBkYXRlRmllbGRzLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KCkpO1xyXG4iXX0=
