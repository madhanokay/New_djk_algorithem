class Dijkstra

  p "Simple terms dijkstra algorithm is find the shortest path  our graph app(it includes find your distance vertex, minumum distance,path of strings)"

    
  def initialize(graph_datas)
    #p "graph_datas"
    @dj_graph = Hash.new
    #p @dj_graph
    for conn in graph_datas
      arr_graph = conn.split('-')
      if @dj_graph[arr_graph[0]].nil?
      	@dj_graph[arr_graph[0]] = Array.new
      end
      @dj_graph[arr_graph[0]] << arr_graph[1]
      
      if @dj_graph[arr_graph[1]].nil?
      	@dj_graph[arr_graph[1]] = Array.new
      end
      @dj_graph[arr_graph[1]] << arr_graph[0]      
    end
    
  end
  
  def getShortestPath(start_pnt,end_pnt)
    ###if st_pt and ed_pt is equal return first value
   
    @distance = Hash.new
    @prev = Hash.new  

    if start_pnt == end_pnt
      return start_pnt  
    end
    @st_pt = [] ##initialize array for start point
    @ed_pt = []
    @distance[start_pnt] = 0
    #p "@distance[start_pnt]"
    @st_pt << start_pnt
    @st_pt.uniq!
    ##check start point to get minimum distance 
    while @st_pt.length() > 0
      each_string = getMinimum(@st_pt)
      #p "each_string"
      #p each_string
      @ed_pt << each_string
      @ed_pt.uniq! ##need to return as nil value
      @st_pt.delete(each_string)
      findMinimalDistances(each_string)
    end
    return getPath(end_pnt)
  end

  def getMinimum(each_strings)
    mineach_string = nil
    each_strings.each { |each_string|
      if mineach_string.nil?
        mineach_string = each_string ##if value as nil then no need to push the path
      else 
        ##find shortdistance for all strings
        if getShortestDistance(each_string) < getShortestDistance(mineach_string)
          mineach_string = each_string
          #p each_string
        end
      end
    }
    return mineach_string
  end
  
  ##just find string shortway of en_pt string
  def getShortestDistance(destination)
    ## if alays comes your ed_pt as empty value and no path so defined some interger as en_pt size
    d = @distance[destination]
    #p @distance[destination]
    if d == nil
      return (2**(0.size * 8 -2) -1) #max integer
    else
      return d
    end  
  end

  def findMinimalDistances(each_string)
    adjacenteach_strings = getNeighbors(each_string) ##find next string of ever string
    adjacenteach_strings.each{ |destination_pt|
      #if getShortestDistance(destination_pt) < (getShortestDistance
      if getShortestDistance(destination_pt) > (getShortestDistance(each_string) + getDistance(each_string, destination_pt))
        @distance[destination_pt] = getShortestDistance(each_string)+getDistance(each_string, destination_pt)      
        @prev[destination_pt] = each_string
        @st_pt << destination_pt
        @st_pt.uniq!
        #@st_pt.delete
      end
    }
  end

  ##hereonly find each string on our list path and send to hash value
  def getNeighbors(each_string)
    return @dj_graph[each_string]  
  end
  
  ##just get your string and find distance of two strings
  def getDistance(each_string, destination_pt)
    if @dj_graph[each_string].include? destination_pt
      return 1
    end
  end


  ##final path find on yout en_pt
  def getPath(destination_pt)
    path = []
    step = destination_pt
    #p step.blank?
    #p @prev
    path << destination_pt
    while @prev[step] != nil
      step = @prev[step] ## herr you find previous string and that string also not in other start point of string list
      path << step ##pass the result on your path
    end
    
     path.join('-')
  end
end

#tests!
dj = Dijkstra.new(["A-B","B-C","D-E","A-D","C-D"]) 
p "dj"          
p dj.getShortestPath("A","D")

